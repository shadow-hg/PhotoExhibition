import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const settingsPath = path.resolve(__dirname, '..', 'config', 'settings.json');
const rawSettings = fs.readFileSync(settingsPath, 'utf-8');
const settings = JSON.parse(rawSettings) as {
  backend: { publicBaseUrl: string };
  frontend: { devHost: string; devPort: number };
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: settings.frontend.devHost,
    port: settings.frontend.devPort,
    proxy: {
      '/api': {
        target: settings.backend.publicBaseUrl,
        changeOrigin: true,
      },
    },
  },
});
