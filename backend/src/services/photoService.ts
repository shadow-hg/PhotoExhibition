import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import exifr from 'exifr';
import type OSS from 'ali-oss';
import type { PhotoMetadata } from '../types';
import { createOSSClient } from '../utils/oss';

const ORIGINAL_PREFIX = 'photos';
const THUMB_PREFIX = 'thumbs';

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
  const transformer = sharp(buffer).resize(800, 800, {
    fit: 'inside',
    withoutEnlargement: true
  });
  const { width, height } = await transformer.metadata();
  const thumbnail = await transformer.jpeg({ quality: 80 }).toBuffer();
  return { thumbnail, width: width ?? 0, height: height ?? 0 };
};

export const processUpload = async (objectKey: string, client?: OSS) => {
  const oss = client ?? createOSSClient();
  const original = await oss.get(objectKey);
  const buffer = original.content as Buffer;
  const exif = ((await exifr.parse(buffer)) ?? {}) as Record<string, unknown>;
  const thumb = await generateThumbnail(buffer);

  const relativePath = objectKey.startsWith(`${ORIGINAL_PREFIX}/`)
    ? objectKey.slice(ORIGINAL_PREFIX.length + 1)
    : objectKey;

  const thumbnailKey = path.join(THUMB_PREFIX, relativePath.replace(path.extname(relativePath), '.jpg'));
  try {
    await oss.head(thumbnailKey);
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status?: number }).status) : 0;
    if (status !== 404) {
      throw error;
    }
    await oss.put(thumbnailKey, thumb.thumbnail, {
      headers: {
        'Content-Type': 'image/jpeg'
      }
    });
  }

  const id = relativePath.replace(/\.[^/.]+$/, '').replace(/[\/]/g, '-');

  const metadata: PhotoMetadata = {
    id: id || randomUUID(),
    title: path.parse(relativePath).name,
    src: oss.signatureUrl(objectKey, { expires: 3600 }),
    thumbnail: oss.signatureUrl(thumbnailKey, { expires: 3600 }),
    width: thumb.width,
    height: thumb.height,
    ratio: thumb.height ? thumb.width / thumb.height : undefined,
    ...normalizeExif(exif)
  };

  return metadata;
};

export const getPhotosByGroup = async (slug: string) => {
  const client = createOSSClient();
  const result: PhotoMetadata[] = [];
  const list = await client.list({ prefix: `${ORIGINAL_PREFIX}/${slug}` }, {});
  for (const item of list.objects ?? []) {
    if (!item.name) continue;
    const metadata = await processUpload(item.name, client);
    result.push(metadata);
  }
  return result;
};
