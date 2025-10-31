import fs from 'fs';
import path from 'path';

export type AppSettings = {
  backend: {
    host: string;
    port: number;
    publicBaseUrl: string;
  };
  frontend: {
    devHost: string;
    devPort: number;
    publicBaseUrl: string;
  };
  media: {
    publicPath: string;
  };
};

const SETTINGS_PATH = path.resolve(__dirname, '..', '..', 'config', 'settings.json');

let cachedSettings: AppSettings | null = null;

function loadSettings(): AppSettings {
  if (cachedSettings) {
    return cachedSettings;
  }

  if (!fs.existsSync(SETTINGS_PATH)) {
    throw new Error(`Missing settings file at ${SETTINGS_PATH}`);
  }

  const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8');
  cachedSettings = JSON.parse(raw) as AppSettings;
  return cachedSettings;
}

export function getSettings(): AppSettings {
  return loadSettings();
}
