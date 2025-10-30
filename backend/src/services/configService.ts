import { createHash } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type OSS from 'ali-oss';
import type { SiteConfig } from '../types';
import { createOSSClient, readJSON, writeJSON } from '../utils/oss';
import { isLocalMode } from './runtime';

const CONFIG_PATH = process.env.SITE_CONFIG_PATH ?? 'config/site_config.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_CONFIG_PATH = path.resolve(__dirname, '../../..', CONFIG_PATH);

let cachedConfig: SiteConfig | null = null;
let lastEtag: string | null = null;

const computeHash = (config: SiteConfig) =>
  createHash('sha1').update(JSON.stringify(config)).digest('hex');

const shouldFallbackToLocalFile = (error: unknown) =>
  error instanceof Error && error.message.includes('Missing OSS configuration environment variables');

const readLocalConfig = async () => {
  const file = await readFile(LOCAL_CONFIG_PATH, 'utf-8');
  return JSON.parse(file) as SiteConfig;
};

const writeLocalConfig = async (config: SiteConfig) => {
  await mkdir(path.dirname(LOCAL_CONFIG_PATH), { recursive: true });
  await writeFile(LOCAL_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
};

export const getConfig = async (client?: OSS): Promise<SiteConfig> => {
  if (isLocalMode()) {
    const config = await readLocalConfig();
    cachedConfig = config;
    lastEtag = computeHash(config);
    return config;
  }

  try {
    const oss = client ?? createOSSClient();
    const config = await readJSON<SiteConfig>(oss, CONFIG_PATH);
    const etag = computeHash(config);
    if (!lastEtag || lastEtag !== etag) {
      cachedConfig = config;
      lastEtag = etag;
    }
    return config;
  } catch (error) {
    if (!shouldFallbackToLocalFile(error)) {
      throw error;
    }

    const config = await readLocalConfig();
    cachedConfig = config;
    lastEtag = computeHash(config);
    return config;
  }
};

export const getCachedConfig = async () => {
  if (cachedConfig) return cachedConfig;
  return getConfig();
};

export const updateConfig = async (config: SiteConfig) => {
  if (isLocalMode()) {
    await writeLocalConfig(config);
    cachedConfig = config;
    lastEtag = computeHash(config);
    return config;
  }

  try {
    const oss = createOSSClient();
    await writeJSON(oss, CONFIG_PATH, config);
  } catch (error) {
    if (!shouldFallbackToLocalFile(error)) {
      throw error;
    }
    await writeLocalConfig(config);
  }
  cachedConfig = config;
  lastEtag = computeHash(config);
  return config;
};
