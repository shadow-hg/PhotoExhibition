import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import sharp from 'sharp';
import exifr from 'exifr';
import type OSS from 'ali-oss';
import type { PhotoMetadata } from '../types';
import { createOSSClient, readJSON, writeJSON } from '../utils/oss';
import { isLocalMode } from './runtime';
import { readLocalBuffer, readLocalJSON, writeLocalBuffer, writeLocalJSON, listLocalFiles, toLocalStaticUrl } from './localFs';

const ORIGINAL_PREFIX = 'photos';
const THUMB_PREFIX = 'thumbs';
const METADATA_PREFIX = 'metadata';
const SIGNED_URL_TTL_SECONDS = 3600;

interface StoredMetadata {
  objectKey: string;
  thumbnailKey: string;
  sourceEtag?: string;
  updatedAt: string;
  data: Omit<PhotoMetadata, 'src' | 'thumbnail'>;
}

const getStatusCode = (error: unknown) =>
  typeof error === 'object' && error && 'status' in error ? Number((error as { status?: number }).status) : 0;

const signPhoto = (client: OSS, stored: StoredMetadata): PhotoMetadata => ({
  ...stored.data,
  src: client.signatureUrl(stored.objectKey, { expires: SIGNED_URL_TTL_SECONDS }),
  thumbnail: client.signatureUrl(stored.thumbnailKey, { expires: SIGNED_URL_TTL_SECONDS })
});

const buildLocalPhoto = (stored: StoredMetadata): PhotoMetadata => ({
  ...stored.data,
  src: toLocalStaticUrl(stored.objectKey),
  thumbnail: toLocalStaticUrl(stored.thumbnailKey)
});

const parseExifValue = (value: unknown) => (value == null ? undefined : String(value));

const normalizeExif = (exif: Record<string, unknown>): Partial<PhotoMetadata> => {
  const shutterSpeed = exif.ExposureTime
    ? `${exif.ExposureTime}s`
    : exif.ShutterSpeedValue
    ? `${exif.ShutterSpeedValue}`
    : undefined;
  return {
    captureTime: parseExifValue(exif.DateTimeOriginal || exif.CreateDate),
    camera: parseExifValue(exif.Model),
    lens: parseExifValue(exif.LensModel),
    iso: exif.ISO ? Number(exif.ISO) : undefined,
    aperture: parseExifValue(exif.FNumber || exif.ApertureValue),
    shutter: shutterSpeed,
    focalLength: exif.FocalLength ? `${exif.FocalLength}mm` : undefined
  };
};

export const generateThumbnail = async (buffer: Buffer) => {
  const transformer = sharp(buffer)
    .rotate()
    .resize(800, 800, {
      fit: 'inside',
      withoutEnlargement: true
    });
  const { width, height } = await transformer.metadata();
  const thumbnail = await transformer.jpeg({ quality: 80 }).toBuffer();
  return { thumbnail, width: width ?? 0, height: height ?? 0 };
};

const normalizeObjectKey = (objectKey: string) => objectKey.replace(/\\/g, '/').replace(/^\/+/, '');

const getRelativePath = (objectKey: string) => {
  const normalized = normalizeObjectKey(objectKey);
  if (normalized.startsWith(`${ORIGINAL_PREFIX}/`)) {
    return normalized.slice(ORIGINAL_PREFIX.length + 1);
  }
  return normalized;
};

const ensureThumbnailKey = (relativePath: string) =>
  path.posix.join(THUMB_PREFIX, relativePath.replace(/\.[^/.]+$/, '.jpg'));

const ensureMetadataKey = (relativePath: string) =>
  path.posix.join(METADATA_PREFIX, relativePath.replace(/\.[^/.]+$/, '.json'));

const computeBufferHash = (buffer: Buffer) => createHash('sha1').update(buffer).digest('hex');

const processUploadLocal = async (objectKey: string): Promise<PhotoMetadata> => {
  const relativePath = getRelativePath(objectKey);
  const normalizedRelative = relativePath.replace(/^\/+/, '');
  const objectKeyWithPrefix = path.posix.join(ORIGINAL_PREFIX, normalizedRelative);

  const original = await readLocalBuffer(objectKeyWithPrefix);
  const sourceEtag = computeBufferHash(original);

  const thumbnailKey = ensureThumbnailKey(normalizedRelative);
  const metadataKey = ensureMetadataKey(normalizedRelative);

  let cached: StoredMetadata | null = null;
  try {
    cached = await readLocalJSON<StoredMetadata>(metadataKey);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  if (cached && cached.sourceEtag === sourceEtag) {
    try {
      await readLocalBuffer(cached.thumbnailKey);
      return buildLocalPhoto(cached);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  const exif = ((await exifr.parse(original)) ?? {}) as Record<string, unknown>;
  const thumb = await generateThumbnail(original);

  await writeLocalBuffer(thumbnailKey, thumb.thumbnail);

  const baseId = cached?.data.id ?? normalizedRelative.replace(/\.[^/.]+$/, '').replace(/[\/]/g, '-');

  const normalized = normalizeExif(exif);
  const mergedData: StoredMetadata['data'] = {
    ...cached?.data,
    id: baseId || randomUUID(),
    title: cached?.data?.title ?? path.parse(normalizedRelative).name,
    width: thumb.width,
    height: thumb.height,
    ratio: thumb.height ? thumb.width / thumb.height : undefined
  };

  for (const [key, value] of Object.entries(normalized)) {
    if (value !== undefined) {
      (mergedData as Record<string, unknown>)[key] = value;
    }
  }

  const stored: StoredMetadata = {
    objectKey: objectKeyWithPrefix.replace(/\\/g, '/'),
    thumbnailKey: thumbnailKey.replace(/\\/g, '/'),
    sourceEtag,
    updatedAt: new Date().toISOString(),
    data: mergedData
  };

  await writeLocalJSON(metadataKey, stored);

  return buildLocalPhoto(stored);
};

export const processUpload = async (objectKey: string, client?: OSS) => {
  if (isLocalMode()) {
    return processUploadLocal(objectKey);
  }

  const oss = client ?? createOSSClient();
  const relativePath = objectKey.startsWith(`${ORIGINAL_PREFIX}/`)
    ? objectKey.slice(ORIGINAL_PREFIX.length + 1)
    : objectKey;

  const thumbnailKey = path.join(THUMB_PREFIX, relativePath.replace(path.extname(relativePath), '.jpg'));
  const metadataKey = path.join(METADATA_PREFIX, relativePath.replace(path.extname(relativePath), '.json'));

  const head = await oss.head(objectKey);
  const sourceEtagHeader = String(head.res.headers['etag'] ?? '').replace(/"/g, '').trim();
  const sourceEtag = sourceEtagHeader || undefined;

  let cached: StoredMetadata | null = null;
  try {
    cached = await readJSON<StoredMetadata>(oss, metadataKey);
  } catch (error) {
    if (getStatusCode(error) !== 404) {
      throw error;
    }
  }

  if (cached && cached.sourceEtag === sourceEtag) {
    try {
      await oss.head(cached.thumbnailKey);
      return signPhoto(oss, cached);
    } catch (error) {
      if (getStatusCode(error) !== 404) {
        throw error;
      }
    }
  }

  const original = await oss.get(objectKey);
  const buffer = original.content as Buffer;
  const exif = ((await exifr.parse(buffer)) ?? {}) as Record<string, unknown>;
  const thumb = await generateThumbnail(buffer);

  await oss.put(thumbnailKey, thumb.thumbnail, {
    headers: {
      'Content-Type': 'image/jpeg'
    }
  });

  const baseId = cached?.data.id ?? relativePath.replace(/\.[^/.]+$/, '').replace(/[\/]/g, '-');

  const normalized = normalizeExif(exif);
  const mergedData: StoredMetadata['data'] = {
    ...cached?.data,
    id: baseId || randomUUID(),
    title: cached?.data?.title ?? path.parse(relativePath).name,
    width: thumb.width,
    height: thumb.height,
    ratio: thumb.height ? thumb.width / thumb.height : undefined
  };

  for (const [key, value] of Object.entries(normalized)) {
    if (value !== undefined) {
      (mergedData as Record<string, unknown>)[key] = value;
    }
  }

  const stored: StoredMetadata = {
    objectKey,
    thumbnailKey,
    sourceEtag,
    updatedAt: new Date().toISOString(),
    data: mergedData
  };

  await writeJSON(oss, metadataKey, stored);

  return signPhoto(oss, stored);
};

export const getPhotosByGroup = async (slug: string) => {
  if (isLocalMode()) {
    const normalizedSlug = slug.replace(/\\/g, '/').replace(/^\/+/, '');
    const metadataPrefix = path.posix.join(METADATA_PREFIX, normalizedSlug);
    const files = await listLocalFiles(metadataPrefix);
    const result: PhotoMetadata[] = [];

    for (const file of files.filter((key) => key.endsWith('.json'))) {
      try {
        const metadata = await readLocalJSON<StoredMetadata>(file);
        result.push(buildLocalPhoto(metadata));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          continue;
        }
        throw error;
      }
    }
    return result;
  }

  const client = createOSSClient();
  const result: PhotoMetadata[] = [];
  let isTruncated = true;
  let marker: string | undefined;

  while (isTruncated) {
    const list = await client.list({
      prefix: `${ORIGINAL_PREFIX}/${slug}`,
      marker,
      'max-keys': 1000
    });
    for (const item of list.objects ?? []) {
      if (!item.name) continue;
      const metadata = await processUpload(item.name, client);
      result.push(metadata);
    }
    isTruncated = Boolean(list.isTruncated);
    marker = list.nextMarker || undefined;
    if (!isTruncated) {
      break;
    }
  }
  return result;
};
