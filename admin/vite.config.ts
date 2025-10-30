import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET ?? 'http://localhost:9000';
  const enableProxy = mode !== 'production';

  return {
    plugins: [react()],
    server: {
      port: 5174,
      ...(enableProxy
        ? {
            proxy: {
              '/api': {
                target: proxyTarget,
                changeOrigin: true
              }
            }
          }
        : {})
    }
  };
});
