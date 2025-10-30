import express from 'express';
import CryptoJS from 'crypto-js';
import { randomUUID } from 'node:crypto';
import { createOSSClient, appendLog, readText } from '../utils/oss';
import { getConfig, getCachedConfig, updateConfig } from '../services/configService';
import { getPhotosByGroup, processUpload } from '../services/photoService';
import type { SiteConfig, TrackPayload } from '../types';
import { isLocalMode } from '../services/runtime';
import { appendLocalLog, readLocalText, toLocalStaticUrl } from '../services/localFs';

const router = express.Router();

const DOWNLOAD_HASH = process.env.DOWNLOAD_PASSWORD_HASH;
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH;

const hashText = (text: string) => CryptoJS.SHA256(text).toString();

const isValidHash = (hash?: string | null) => hash && hash.length === 64;

const ADMIN_TOKEN_TTL_SECONDS = Number(process.env.ADMIN_TOKEN_TTL_SECONDS ?? 3600);

const adminSessions = new Map<string, number>();

const cleanupExpiredSessions = () => {
  const now = Date.now();
  for (const [token, expiresAt] of adminSessions.entries()) {
    if (expiresAt <= now) {
      adminSessions.delete(token);
    }
  }
};

const createSessionToken = () => {
  cleanupExpiredSessions();
  const token = randomUUID();
  const expiresAt = Date.now() + ADMIN_TOKEN_TTL_SECONDS * 1000;
  adminSessions.set(token, expiresAt);
  return { token, expiresAt };
};

const validateSessionToken = (token: string | undefined) => {
  if (!token) return false;
  cleanupExpiredSessions();
  const expiresAt = adminSessions.get(token);
  if (!expiresAt) {
    return false;
  }
  if (expiresAt <= Date.now()) {
    adminSessions.delete(token);
    return false;
  }
  adminSessions.set(token, Date.now() + ADMIN_TOKEN_TTL_SECONDS * 1000);
  return true;
};

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!isValidHash(ADMIN_HASH)) {
    return res.status(500).json({ message: 'ADMIN_PASSWORD_HASH 未配置' });
  }

  const token = req.headers['x-admin-token'] as string | undefined;
  if (!validateSessionToken(token)) {
    return res.status(401).json({ message: '管理员验证失败' });
  }

  return next();
};

router.get('/getConfig', async (_req, res) => {
  try {
    const config = await getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.get('/getPhotos', async (req, res) => {
  try {
    const slug = String(req.query.path ?? '').trim();
    if (!slug) {
      return res.status(400).json({ message: 'Missing path parameter' });
    }

    const config = await getCachedConfig();
    const normalizedSlug = slug.toLowerCase();
    const fromConfig = config.gallery.find((group) => {
      const candidate = group.slug ?? group.name;
      return candidate.toLowerCase() === normalizedSlug;
    });

    if (fromConfig) {
      return res.json({ photos: fromConfig.photos });
    }

    const photos = await getPhotosByGroup(slug);
    res.json({ photos });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/verify', async (req, res) => {
  if (!isValidHash(DOWNLOAD_HASH)) {
    return res.status(500).json({ message: 'DOWNLOAD_PASSWORD_HASH is not configured' });
  }

  const { password } = req.body as { password?: string };
  if (!password) {
    return res.status(400).json({ valid: false, message: 'Missing password' });
  }

  const valid = hashText(password) === DOWNLOAD_HASH;
  if (!valid) {
    return res.status(401).json({ valid: false });
  }

  const config = await getCachedConfig();
  const download = config.actions?.download;

  if (!download) {
    return res.status(404).json({ valid: true, message: 'Download link is not configured' });
  }

  const normalizedDownload = download.replace(/\\/g, '/');

  if (isLocalMode()) {
    const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(normalizedDownload);
    const localPrefix = 'local://';

    if (normalizedDownload.startsWith('oss://')) {
      return res.status(400).json({
        valid: true,
        message: 'Local mode does not support oss:// download targets. Use a relative path or explicit URL.'
      });
    }

    const resolved = normalizedDownload.startsWith(localPrefix)
      ? toLocalStaticUrl(normalizedDownload.slice(localPrefix.length))
      : hasProtocol
      ? normalizedDownload
      : toLocalStaticUrl(normalizedDownload);

    return res.json({ valid: true, url: resolved });
  }

  const oss = createOSSClient();
  const signedUrl = normalizedDownload.startsWith('oss://')
    ? (() => {
        const [, pathPart = ''] = normalizedDownload.replace('oss://', '').split(/\/(.+)/);
        return oss.signatureUrl(pathPart ?? '');
      })()
    : normalizedDownload;

  res.json({ valid: true, url: signedUrl });
});

router.post('/track', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      ip: req.headers['x-forwarded-for'] ?? req.socket.remoteAddress,
      timestamp: new Date().toISOString(),
    };
    if (isLocalMode()) {
      await appendLocalLog('logs/access.log', `${JSON.stringify(payload)}\n`);
    } else {
      const client = createOSSClient();
      await appendLog(client, 'logs/access.log', `${JSON.stringify(payload)}\n`);
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});
router.post('/admin/login', (req, res) => {
  if (!isValidHash(ADMIN_HASH)) {
    return res.status(500).json({ message: 'ADMIN_PASSWORD_HASH 未配置' });
  }

  const { password } = req.body as { password?: string };
  if (!password) {
    return res.status(400).json({ message: '缺少密码' });
  }

  if (hashText(password) !== ADMIN_HASH) {
    return res.status(401).json({ message: '管理员验证失败' });
  }

  const session = createSessionToken();

  res.json({
    token: session.token,
    expiresAt: new Date(session.expiresAt).toISOString()
  });
});

router.post('/admin/upload', requireAdmin, async (req, res) => {
  try {
    const { objectKey } = req.body as { objectKey?: string };
    if (!objectKey) {
      return res.status(400).json({ message: '缺少 objectKey' });
    }

    const metadata = await processUpload(objectKey);
    res.json(metadata);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/admin/updateConfig', requireAdmin, async (req, res) => {
  try {
    const payload = req.body as SiteConfig;
    payload.updatedAt = new Date().toISOString();
    const config = await updateConfig(payload);
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.get('/admin/listLogs', requireAdmin, async (req, res) => {
  try {
    const content = isLocalMode()
      ? await readLocalText('logs/access.log')
      : await readText(createOSSClient(), 'logs/access.log');
    const lines = content
      .trim()
      .split('\n')
      .filter(Boolean)
      .slice(-200)
      .map((line): TrackPayload => JSON.parse(line));
    res.json({ logs: lines });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});
export default router;


