import db from '../db';
import { mapCollection, mapExhibition, mapMessage, mapPhoto } from '../utils/transformers';
import { Collection, ContactMessage, Exhibition, GalleryStats, Photo } from '../types';

export interface PhotoFilters {
  featured?: boolean;
  collectionId?: number;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export function getPhotos(filters: PhotoFilters = {}): Photo[] {
  const conditions: string[] = [];
  const params: Record<string, any> = {};

  if (typeof filters.featured === 'boolean') {
    conditions.push('is_featured = @featured');
    params.featured = filters.featured ? 1 : 0;
  }

  if (typeof filters.collectionId === 'number') {
    conditions.push('id IN (SELECT photo_id FROM photo_collections WHERE collection_id = @collectionId)');
    params.collectionId = filters.collectionId;
  }

  if (filters.tag) {
    conditions.push("json_extract(tags, '$') LIKE @tagPattern");
    params.tagPattern = `%${filters.tag}%`;
  }

  if (filters.search) {
    conditions.push('(title LIKE @search OR description LIKE @search OR location LIKE @search)');
    params.search = `%${filters.search}%`;
  }

  let sql = 'SELECT * FROM photos';
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY is_featured DESC, views DESC, created_at DESC';
  if (typeof filters.limit === 'number') {
    sql += ' LIMIT @limit';
    params.limit = filters.limit;
  }
  if (typeof filters.offset === 'number') {
    sql += ' OFFSET @offset';
    params.offset = filters.offset;
  }

  return db.prepare(sql).all(params).map(mapPhoto);
}

export function getPhotoById(id: number): Photo | null {
  const row = db.prepare('SELECT * FROM photos WHERE id = ?').get(id);
  return row ? mapPhoto(row) : null;
}

export function createPhoto(input: Partial<Photo>): Photo {
  const stmt = db.prepare(`
    INSERT INTO photos (title, description, image_url, location, camera, lens, tags, taken_at, is_featured, palette, aspect_ratio, views, ai_notes)
    VALUES (@title, @description, @imageUrl, @location, @camera, @lens, @tags, @takenAt, @isFeatured, @palette, @aspectRatio, @views, @aiNotes)
  `);

  const info = stmt.run({
    title: input.title,
    description: input.description ?? '',
    imageUrl: input.imageUrl,
    location: input.location ?? null,
    camera: input.camera ?? null,
    lens: input.lens ?? null,
    tags: JSON.stringify(input.tags ?? []),
    takenAt: input.takenAt ?? null,
    isFeatured: input.isFeatured ? 1 : 0,
    palette: input.palette ? JSON.stringify(input.palette) : null,
    aspectRatio: input.aspectRatio ?? null,
    views: input.views ?? 0,
    aiNotes: input.aiNotes ?? null,
  });

  return getPhotoById(Number(info.lastInsertRowid))!;
}

export function updatePhoto(id: number, input: Partial<Photo>): Photo | null {
  const stmt = db.prepare(`
    UPDATE photos SET
      title = COALESCE(@title, title),
      description = COALESCE(@description, description),
      image_url = COALESCE(@imageUrl, image_url),
      location = COALESCE(@location, location),
      camera = COALESCE(@camera, camera),
      lens = COALESCE(@lens, lens),
      tags = COALESCE(@tags, tags),
      taken_at = COALESCE(@takenAt, taken_at),
      is_featured = CASE WHEN @isFeatured IS NULL THEN is_featured ELSE @isFeatured END,
      palette = CASE WHEN @palette IS NULL THEN palette ELSE @palette END,
      aspect_ratio = COALESCE(@aspectRatio, aspect_ratio),
      views = COALESCE(@views, views),
      ai_notes = COALESCE(@aiNotes, ai_notes),
      updated_at = datetime('now')
    WHERE id = @id
  `);

  stmt.run({
    id,
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl,
    location: input.location,
    camera: input.camera,
    lens: input.lens,
    tags: input.tags ? JSON.stringify(input.tags) : undefined,
    takenAt: input.takenAt,
    isFeatured: typeof input.isFeatured === 'boolean' ? (input.isFeatured ? 1 : 0) : null,
    palette: input.palette ? JSON.stringify(input.palette) : input.palette === undefined ? undefined : null,
    aspectRatio: input.aspectRatio,
    views: input.views,
    aiNotes: input.aiNotes,
  });

  return getPhotoById(id);
}

export function deletePhoto(id: number): void {
  db.prepare('DELETE FROM photos WHERE id = ?').run(id);
}

export function incrementPhotoView(id: number): void {
  db.prepare('UPDATE photos SET views = views + 1 WHERE id = ?').run(id);
}

export function getCollections(): Collection[] {
  return db.prepare('SELECT * FROM collections ORDER BY created_at DESC').all().map(mapCollection);
}

export function getCollectionById(id: number): Collection | null {
  const row = db.prepare('SELECT * FROM collections WHERE id = ?').get(id);
  return row ? mapCollection(row) : null;
}

export function createCollection(input: Partial<Collection> & { photoIds?: number[] }): Collection {
  const stmt = db.prepare(`
    INSERT INTO collections (name, description, cover_photo_id, hero_image_url)
    VALUES (@name, @description, @coverPhotoId, @heroImageUrl)
  `);
  const info = stmt.run({
    name: input.name,
    description: input.description ?? '',
    coverPhotoId: input.coverPhotoId ?? null,
    heroImageUrl: input.heroImageUrl ?? null,
  });

  const collectionId = Number(info.lastInsertRowid);
  if (input.photoIds && input.photoIds.length > 0) {
    const insert = db.prepare('INSERT OR IGNORE INTO photo_collections (photo_id, collection_id) VALUES (?, ?)');
    const transaction = db.transaction((ids: number[]) => {
      ids.forEach((photoId) => insert.run(photoId, collectionId));
    });
    transaction(input.photoIds);
  }

  return getCollectionById(collectionId)!;
}

export function updateCollection(id: number, input: Partial<Collection> & { photoIds?: number[] }): Collection | null {
  db.prepare(`
    UPDATE collections SET
      name = COALESCE(@name, name),
      description = COALESCE(@description, description),
      cover_photo_id = CASE WHEN @coverPhotoId IS NULL THEN cover_photo_id ELSE @coverPhotoId END,
      hero_image_url = CASE WHEN @heroImageUrl IS NULL THEN hero_image_url ELSE @heroImageUrl END
    WHERE id = @id
  `).run({
    id,
    name: input.name,
    description: input.description,
    coverPhotoId: input.coverPhotoId === undefined ? undefined : input.coverPhotoId,
    heroImageUrl: input.heroImageUrl === undefined ? undefined : input.heroImageUrl,
  });

  if (input.photoIds) {
    const deleteStmt = db.prepare('DELETE FROM photo_collections WHERE collection_id = ?');
    const insertStmt = db.prepare('INSERT INTO photo_collections (photo_id, collection_id) VALUES (?, ?)');
    const transaction = db.transaction((ids: number[]) => {
      deleteStmt.run(id);
      ids.forEach((photoId) => insertStmt.run(photoId, id));
    });
    transaction(input.photoIds);
  }

  return getCollectionById(id);
}

export function deleteCollection(id: number): void {
  const transaction = db.transaction((collectionId: number) => {
    db.prepare('DELETE FROM photo_collections WHERE collection_id = ?').run(collectionId);
    db.prepare('DELETE FROM collections WHERE id = ?').run(collectionId);
  });
  transaction(id);
}

export function getExhibitions(): Exhibition[] {
  return db.prepare('SELECT * FROM exhibitions ORDER BY start_date DESC').all().map(mapExhibition);
}

export function getExhibitionById(id: number): Exhibition | null {
  const row = db.prepare('SELECT * FROM exhibitions WHERE id = ?').get(id);
  return row ? mapExhibition(row) : null;
}

export function createExhibition(input: Partial<Exhibition>): Exhibition {
  const info = db.prepare(`
    INSERT INTO exhibitions (title, description, location, start_date, end_date, hero_image_url)
    VALUES (@title, @description, @location, @startDate, @endDate, @heroImageUrl)
  `).run({
    title: input.title,
    description: input.description ?? '',
    location: input.location,
    startDate: input.startDate,
    endDate: input.endDate,
    heroImageUrl: input.heroImageUrl ?? null,
  });

  return getExhibitionById(Number(info.lastInsertRowid))!;
}

export function updateExhibition(id: number, input: Partial<Exhibition>): Exhibition | null {
  db.prepare(`
    UPDATE exhibitions SET
      title = COALESCE(@title, title),
      description = COALESCE(@description, description),
      location = COALESCE(@location, location),
      start_date = COALESCE(@startDate, start_date),
      end_date = COALESCE(@endDate, end_date),
      hero_image_url = CASE WHEN @heroImageUrl IS NULL THEN hero_image_url ELSE @heroImageUrl END
    WHERE id = @id
  `).run({
    id,
    title: input.title,
    description: input.description,
    location: input.location,
    startDate: input.startDate,
    endDate: input.endDate,
    heroImageUrl: input.heroImageUrl === undefined ? undefined : input.heroImageUrl,
  });

  return getExhibitionById(id);
}

export function deleteExhibition(id: number): void {
  db.prepare('DELETE FROM exhibitions WHERE id = ?').run(id);
}

export function recordMessage(input: { name: string; email: string; message: string }): ContactMessage {
  const info = db.prepare(`
    INSERT INTO contact_messages (name, email, message)
    VALUES (@name, @email, @message)
  `).run(input);
  return getMessageById(Number(info.lastInsertRowid))!;
}

export function getMessages(): ContactMessage[] {
  return db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all().map(mapMessage);
}

export function updateMessageStatus(id: number, status: ContactMessage['status']): ContactMessage | null {
  db.prepare('UPDATE contact_messages SET status = @status WHERE id = @id').run({ id, status });
  return getMessageById(id);
}

export function getMessageById(id: number): ContactMessage | null {
  const row = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
  return row ? mapMessage(row) : null;
}

export function getGalleryStats(): GalleryStats {
  const totals = db.prepare(
    `SELECT
        (SELECT COUNT(*) FROM photos) AS total_photos,
        (SELECT COUNT(*) FROM photos WHERE is_featured = 1) AS featured_photos,
        (SELECT COUNT(*) FROM collections) AS total_collections,
        (SELECT COUNT(*) FROM exhibitions) AS total_exhibitions,
        (SELECT IFNULL(SUM(views), 0) FROM photos) AS total_views`
  ).get();

  const tagRows = db.prepare(
    `SELECT lower(trim(json_each.value)) AS tag, COUNT(*) AS count
     FROM photos, json_each(photos.tags)
     GROUP BY tag
     ORDER BY count DESC
     LIMIT 10`
  ).all();

  return {
    totalPhotos: totals.total_photos ?? 0,
    featuredPhotos: totals.featured_photos ?? 0,
    totalCollections: totals.total_collections ?? 0,
    totalExhibitions: totals.total_exhibitions ?? 0,
    totalViews: totals.total_views ?? 0,
    topTags: tagRows
      .filter((row) => row.tag)
      .map((row) => ({ tag: row.tag as string, count: row.count as number })),
  };
}
