import express from 'express';
import CryptoJS from 'crypto-js';
import { createOSSClient, appendLog, readText } from '../utils/oss';
import { getConfig, getCachedConfig, updateConfig } from '../services/configService';
import { getPhotosByGroup, processUpload } from '../services/photoService';
import type { SiteConfig } from '../types';

const router = express.Router();

const DOWNLOAD_HASH = process.env.DOWNLOAD_PASSWORD_HASH;
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH;

const hashText = (text: string) => CryptoJS.SHA256(text).toString();

const isValidHash = (hash?: string | null) => hash && hash.length === 64;

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!isValidHash(ADMIN_HASH)) {
    return res.status(500).json({ message: 'ADMIN_PASSWORD_HASH 未配置' });
  }

  const token = req.headers['x-admin-token'] as string | undefined;
  if (!token || hashText(token) !== ADMIN_HASH) {
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
    return res.status(500).json({ message: 'DOWNLOAD_PASSWORD_HASH 未配置' });
  }

  const { password } = req.body as { password?: string };
  if (!password) {
    return res.status(400).json({ valid: false, message: '缺少密码' });
  }

  const valid = hashText(password) === DOWNLOAD_HASH;
  if (!valid) {
    return res.status(401).json({ valid: false });
  }

  const oss = createOSSClient();
  const config = await getCachedConfig();
  const download = config.actions?.download;

  if (!download) {
    return res.status(404).json({ valid: true, message: '未配置下载链接' });
  }

  const signedUrl = download.startsWith('oss://')
    ? (() => {
        const [, path = ''] = download.replace('oss://', '').split(/\/(.+)/);
        return oss.signatureUrl(path ?? '');
      })()
    : download;

  res.json({ valid: true, url: signedUrl });
});

router.post('/track', async (req, res) => {
  try {
    const client = createOSSClient();
    const payload = {
      ...req.body,
      ip: req.headers['x-forwarded-for'] ?? req.socket.remoteAddress,
      timestamp: new Date().toISOString()
    };
    await appendLog(client, 'logs/access.log', `${JSON.stringify(payload)}\n`);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
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
    const client = createOSSClient();
    const content = await readText(client, 'logs/access.log');
    const lines = content
      .trim()
      .split('\n')
      .filter(Boolean)
      .slice(-200)
      .map((line) => JSON.parse(line));
    res.json({ logs: lines });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;
