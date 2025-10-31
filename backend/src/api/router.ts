import express from 'express';
import CryptoJS from 'crypto-js';
import { randomUUID } from 'node:crypto';
import { createOSSClient, appendLog, readText } from '../utils/oss';
import { getManifest, getCachedManifest, updateManifest } from '../services/configService';
import { processUpload } from '../services/photoService';
import {
  buildAdminDashboard,
  buildGalleryResponse,
  findAlbumBySlug,
  findPhotoById,
  resolveFeaturedPhotos,
  resolveSpotlightAlbums
} from '../services/galleryService';
import type { SiteManifest, TrackPayload } from '../types';
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

const collectSearchable = (manifest: SiteManifest) => {
  const entries: Array<{
    album: string;
    albumName: string;
    photo: SiteManifest['albums'][number]['photos'][number];
  }> = [];
  for (const album of manifest.albums) {
    for (const photo of album.photos ?? []) {
      entries.push({ album: album.slug, albumName: album.name, photo });
    }
  }
  return entries;
};

const resolveDownloadUrl = async (href: string) => {
  const normalized = href.replace(/\\/g, '/');
  if (isLocalMode()) {
    const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(normalized);
    const localPrefix = 'local://';

    if (normalized.startsWith('oss://')) {
      throw new Error('Local mode does not support oss:// download targets. Use a relative path or explicit URL.');
    }

    if (normalized.startsWith(localPrefix)) {
      return toLocalStaticUrl(normalized.slice(localPrefix.length));
    }

    if (hasProtocol) {
      return normalized;
    }

    return toLocalStaticUrl(normalized);
  }

  const oss = createOSSClient();
  if (normalized.startsWith('oss://')) {
    const [, pathPart = ''] = normalized.replace('oss://', '').split(/\/(.+)/);
    return oss.signatureUrl(pathPart ?? '');
  }

  return normalized;
};

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/gallery/manifest', async (_req, res) => {
  try {
    const manifest = await getManifest();
    const response = buildGalleryResponse(manifest);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.get('/gallery/albums/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug ?? '');
    const manifest = await getCachedManifest();
    const album = findAlbumBySlug(manifest, slug);
    if (!album) {
      return res.status(404).json({ message: '未找到对应的图集' });
    }

    const relatedAlbums = resolveSpotlightAlbums(manifest).filter((item) => item.slug !== album.slug);
    const featuredPhotos = resolveFeaturedPhotos(manifest).filter((photo) => album.photos.every((p) => p.id !== photo.id));

    res.json({
      album,
      stats: {
        totalPhotos: album.photos.length,
        totalFavorites: album.photos.filter((photo) => photo.hero || (photo.rating ?? 0) >= 4).length,
        totalLocations: new Set(album.photos.map((photo) => photo.location).filter(Boolean)).size,
        totalTags: new Set(album.photos.flatMap((photo) => photo.tags ?? [])).size
      },
      relatedAlbums,
      featuredPhotos: featuredPhotos.slice(0, 6)
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.get('/gallery/photos/:id', async (req, res) => {
  try {
    const id = String(req.params.id ?? '');
    if (!id) {
      return res.status(400).json({ message: '缺少照片编号' });
    }
    const manifest = await getCachedManifest();
    const photo = findPhotoById(manifest, id);
    if (!photo) {
      return res.status(404).json({ message: '未找到对应的照片' });
    }
    const album = manifest.albums.find((item) => item.photos.some((p) => p.id === id));
    res.json({ photo, album });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.get('/gallery/search', async (req, res) => {
  try {
    const manifest = await getCachedManifest();
    const entries = collectSearchable(manifest);
    const query = String(req.query.q ?? '').trim().toLowerCase();
    const tag = String(req.query.tag ?? '').trim().toLowerCase();
    const camera = String(req.query.camera ?? '').trim().toLowerCase();
    const location = String(req.query.location ?? '').trim().toLowerCase();
    const year = req.query.year ? Number(req.query.year) : undefined;

    const matches = entries.filter(({ photo }) => {
      if (query) {
        const haystack = [photo.title, photo.description, ...(photo.tags ?? [])]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      if (tag && !(photo.tags ?? []).some((item) => item.toLowerCase() === tag)) {
        return false;
      }
      if (camera && (photo.camera ?? '').toLowerCase() !== camera) {
        return false;
      }
      if (location && (photo.location ?? '').toLowerCase() !== location) {
        return false;
      }
      if (year) {
        const capturedYear = photo.capturedAt ? new Date(photo.capturedAt).getUTCFullYear() : undefined;
        if (capturedYear !== year) {
          return false;
        }
      }
      return true;
    });

    const limit = Number(req.query.limit ?? 50);

    res.json({
      total: matches.length,
      results: matches.slice(0, limit).map(({ album, albumName, photo }) => ({
        album,
        albumName,
        photo
      }))
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/gallery/download-link', async (req, res) => {
  try {
    const manifest = await getCachedManifest();
    const action = manifest.actions?.download;
    if (!action) {
      return res.status(404).json({ message: '未配置下载链接' });
    }

    if (action.requirePassword) {
      if (!isValidHash(DOWNLOAD_HASH)) {
        return res.status(500).json({ message: 'DOWNLOAD_PASSWORD_HASH 未配置' });
      }
      const { password } = req.body as { password?: string };
      if (!password) {
        return res.status(400).json({ valid: false, message: '缺少密码' });
      }
      if (hashText(password) !== DOWNLOAD_HASH) {
        return res.status(401).json({ valid: false, message: '密码错误' });
      }
    }

    const url = await resolveDownloadUrl(action.href);
    res.json({ valid: true, url, description: action.description });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/track', async (req, res) => {
  try {
    const payload: TrackPayload = {
      ...req.body,
      ip: req.headers['x-forwarded-for'] ?? req.socket.remoteAddress,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
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

router.get('/admin/dashboard', requireAdmin, async (_req, res) => {
  try {
    const manifest = await getCachedManifest();
    const dashboard = buildAdminDashboard(manifest);
    res.json(dashboard);
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

router.post('/admin/manifest', requireAdmin, async (req, res) => {
  try {
    const payload = req.body as SiteManifest;
    payload.updatedAt = new Date().toISOString();
    const manifest = await updateManifest(payload);
    res.json(manifest);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.get('/admin/logs', requireAdmin, async (_req, res) => {
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
