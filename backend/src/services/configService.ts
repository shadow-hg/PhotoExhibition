import { createHash } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type OSS from 'ali-oss';
import type { SiteManifest } from '../types';
import { createOSSClient, readJSON, writeJSON } from '../utils/oss';
import { isLocalMode } from './runtime';

const CONFIG_PATH = process.env.SITE_CONFIG_PATH ?? 'config/site_config.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_CONFIG_PATH = path.resolve(__dirname, '../../..', CONFIG_PATH);

let cachedManifest: SiteManifest | null = null;
let lastEtag: string | null = null;

const computeHash = (manifest: SiteManifest) =>
  createHash('sha1').update(JSON.stringify(manifest)).digest('hex');

const shouldFallbackToLocalFile = (error: unknown) =>
  error instanceof Error && error.message.includes('Missing OSS configuration environment variables');

const readLocalManifest = async () => {
  const file = await readFile(LOCAL_CONFIG_PATH, 'utf-8');
  return JSON.parse(file) as SiteManifest;
};

const writeLocalManifest = async (manifest: SiteManifest) => {
  await mkdir(path.dirname(LOCAL_CONFIG_PATH), { recursive: true });
  await writeFile(LOCAL_CONFIG_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
};

export const getManifest = async (client?: OSS): Promise<SiteManifest> => {
  if (isLocalMode()) {
    const manifest = await readLocalManifest();
    cachedManifest = manifest;
    lastEtag = computeHash(manifest);
    return manifest;
  }

  try {
    const oss = client ?? createOSSClient();
    const manifest = await readJSON<SiteManifest>(oss, CONFIG_PATH);
    const etag = computeHash(manifest);
    if (!lastEtag || lastEtag !== etag) {
      cachedManifest = manifest;
      lastEtag = etag;
    }
    return manifest;
  } catch (error) {
    if (!shouldFallbackToLocalFile(error)) {
      throw error;
    }

    const manifest = await readLocalManifest();
    cachedManifest = manifest;
    lastEtag = computeHash(manifest);
    return manifest;
  }
};

export const getCachedManifest = async () => {
  if (cachedManifest) return cachedManifest;
  return getManifest();
};

export const updateManifest = async (manifest: SiteManifest) => {
  if (isLocalMode()) {
    await writeLocalManifest(manifest);
    cachedManifest = manifest;
    lastEtag = computeHash(manifest);
    return manifest;
  }

  try {
    const oss = createOSSClient();
    await writeJSON(oss, CONFIG_PATH, manifest);
  } catch (error) {
    if (!shouldFallbackToLocalFile(error)) {
      throw error;
    }
    await writeLocalManifest(manifest);
  }
  cachedManifest = manifest;
  lastEtag = computeHash(manifest);
  return manifest;
};
