import { Collection, ContactMessage, Exhibition, Photo } from '../types';

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function parsePalette(value: string | null): string[] | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function mapPhoto(row: any): Photo {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    imageUrl: row.image_url,
    location: row.location ?? null,
    camera: row.camera ?? null,
    lens: row.lens ?? null,
    tags: parseJsonArray(row.tags),
    takenAt: row.taken_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFeatured: Boolean(row.is_featured),
    palette: parsePalette(row.palette),
    aspectRatio: typeof row.aspect_ratio === 'number' ? row.aspect_ratio : null,
    views: typeof row.views === 'number' ? row.views : 0,
    aiNotes: row.ai_notes ?? null,
  };
}

export function mapCollection(row: any): Collection {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    coverPhotoId: row.cover_photo_id ?? null,
    createdAt: row.created_at,
    heroImageUrl: row.hero_image_url ?? null,
  };
}

export function mapExhibition(row: any): Exhibition {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    heroImageUrl: row.hero_image_url ?? null,
    createdAt: row.created_at,
  };
}

export function mapMessage(row: any): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
    status: row.status,
  };
}
