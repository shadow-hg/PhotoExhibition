import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type RuntimeMode = 'local' | 'cloud';

const rawMode = (process.env.RUNTIME_MODE ?? process.env.APP_MODE ?? '').toLowerCase();

const hasOssConfig = ['OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_BUCKET', 'OSS_REGION'].every(
  (key) => typeof process.env[key] === 'string' && process.env[key]!.length > 0
);

const resolveRuntimeMode = (): RuntimeMode => {
  if (rawMode === 'local') return 'local';
  if (rawMode === 'cloud') return 'cloud';
  return hasOssConfig ? 'cloud' : 'local';
};

const runtimeMode: RuntimeMode = resolveRuntimeMode();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

export const getRuntimeMode = (): RuntimeMode => runtimeMode;

export const isLocalMode = () => runtimeMode === 'local';

export const isCloudMode = () => runtimeMode === 'cloud';

export const getProjectRoot = () => projectRoot;

export const getLocalDataRoot = () => path.resolve(projectRoot, process.env.LOCAL_DATA_ROOT ?? 'storage');
