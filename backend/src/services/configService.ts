import { createHash } from 'crypto';
import type OSS from 'ali-oss';
import type { SiteConfig } from '../types';
import { createOSSClient, readJSON, writeJSON } from '../utils/oss';

const CONFIG_PATH = process.env.SITE_CONFIG_PATH ?? 'config/site_config.json';

let cachedConfig: SiteConfig | null = null;
let lastEtag: string | null = null;

const computeHash = (config: SiteConfig) =>
  createHash('sha1').update(JSON.stringify(config)).digest('hex');

export const getConfig = async (client?: OSS): Promise<SiteConfig> => {
  const oss = client ?? createOSSClient();
  const config = await readJSON<SiteConfig>(oss, CONFIG_PATH);
  const etag = computeHash(config);
  if (!lastEtag || lastEtag !== etag) {
    cachedConfig = config;
    lastEtag = etag;
  }
  return config;
};

export const getCachedConfig = async () => {
  if (cachedConfig) return cachedConfig;
  return getConfig();
};

export const updateConfig = async (config: SiteConfig) => {
  const oss = createOSSClient();
  await writeJSON(oss, CONFIG_PATH, config);
  cachedConfig = config;
  lastEtag = computeHash(config);
  return config;
};
