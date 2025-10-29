import OSS from 'ali-oss';

export const createOSSClient = () => {
  const {
    OSS_ACCESS_KEY_ID: accessKeyId,
    OSS_ACCESS_KEY_SECRET: accessKeySecret,
    OSS_BUCKET: bucket,
    OSS_REGION: region
  } = process.env;

  if (!accessKeyId || !accessKeySecret || !bucket || !region) {
    throw new Error('Missing OSS configuration environment variables');
  }

  return new OSS({
    accessKeyId,
    accessKeySecret,
    bucket,
    region
  });
};

export const readJSON = async <T>(client: OSS, key: string): Promise<T> => {
  const result = await client.get(key);
  const json = result.content?.toString() ?? 'null';
  return JSON.parse(json) as T;
};

export const writeJSON = async <T>(client: OSS, key: string, data: T) => {
  const json = JSON.stringify(data, null, 2);
  await client.put(key, Buffer.from(json), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const readText = async (client: OSS, key: string) => {
  const result = await client.get(key);
  return result.content?.toString('utf-8') ?? '';
};

export const appendLog = async (client: OSS, key: string, payload: string) => {
  let position = 0;
  try {
    const head = await client.head(key);
    position = Number(head.res.headers['content-length'] ?? 0);
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status?: number }).status) : 0;
    if (status !== 404) {
      throw error;
    }
  }

  await client.append(key, Buffer.from(payload), {
    position,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
