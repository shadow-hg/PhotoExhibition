import path from 'node:path';
import { appendFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { getLocalDataRoot } from './runtime';

const sanitizeKey = (key: string) => key.replace(/^[\\/]+/, '');

const ensureWithinRoot = (absolute: string, root: string) => {
  if (!absolute.startsWith(root)) {
    throw new Error(`Path ${absolute} escapes local data root ${root}`);
  }
};

export const resolveLocalKey = (key: string) => {
  const sanitized = sanitizeKey(key);
  const normalized = path.normalize(sanitized);
  if (normalized.startsWith('..')) {
    throw new Error(`Invalid storage key: ${key}`);
  }

  const root = getLocalDataRoot();
  const absolute = path.resolve(root, normalized);
  ensureWithinRoot(absolute, root);

  return {
    root,
    absolute,
    relative: normalized.replace(/\\/g, '/')
  };
};

export const ensureParentDir = async (filePath: string) => {
  await mkdir(path.dirname(filePath), { recursive: true });
};

export const ensureLocalStructure = async () => {
  const { root } = resolveLocalKey('.');
  const required = ['photos', 'thumbs', 'metadata', 'logs'];
  for (const dir of required) {
    await mkdir(path.join(root, dir), { recursive: true });
  }
};

export const readLocalJSON = async <T>(key: string): Promise<T> => {
  const { absolute } = resolveLocalKey(key);
  const content = await readFile(absolute, 'utf-8');
  return JSON.parse(content) as T;
};

export const writeLocalJSON = async (key: string, data: unknown) => {
  const { absolute } = resolveLocalKey(key);
  await ensureParentDir(absolute);
  await writeFile(absolute, JSON.stringify(data, null, 2), 'utf-8');
};

export const readLocalBuffer = async (key: string) => {
  const { absolute } = resolveLocalKey(key);
  return readFile(absolute);
};

export const writeLocalBuffer = async (key: string, buffer: Buffer, contentType?: string) => {
  const { absolute } = resolveLocalKey(key);
  await ensureParentDir(absolute);
  await writeFile(absolute, buffer);
  if (contentType) {
    // no-op placeholder to mirror OSS interface; content type is implicit for local files
  }
};

export const appendLocalLog = async (key: string, payload: string) => {
  const { absolute } = resolveLocalKey(key);
  await ensureParentDir(absolute);
  await appendFile(absolute, payload, 'utf-8');
};

export const readLocalText = async (key: string) => {
  const { absolute } = resolveLocalKey(key);
  try {
    return await readFile(absolute, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return '';
    }
    throw error;
  }
};

const walk = async (absolute: string, baseRelative: string, acc: string[]) => {
  let entries;
  try {
    entries = await readdir(absolute, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return;
    }
    throw error;
  }

  for (const entry of entries) {
    const entryAbsolute = path.join(absolute, entry.name);
    const entryRelative = path.join(baseRelative, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      await walk(entryAbsolute, entryRelative, acc);
    } else {
      acc.push(entryRelative);
    }
  }
};

export const listLocalFiles = async (prefix: string) => {
  const { absolute, relative } = resolveLocalKey(prefix);
  const results: string[] = [];
  await walk(absolute, relative === '.' ? '' : relative, results);
  return results;
};

export const toLocalStaticUrl = (key: string) => `/static/${sanitizeKey(key).replace(/\\/g, '/')}`;
