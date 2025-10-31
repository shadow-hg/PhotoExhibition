import { Router } from 'express';
import { z } from 'zod';
import {
  createCollection,
  deleteCollection,
  getCollectionById,
  getCollections,
  getPhotos,
  updateCollection,
} from '../services/galleryService';

const collectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  coverPhotoId: z.number().int().positive().nullable().optional(),
  heroImageUrl: z.string().url().optional().nullable(),
  photoIds: z.array(z.number().int().positive()).optional(),
});

export const publicCollectionsRouter = Router();

publicCollectionsRouter.get('/', (req, res) => {
  const collections = getCollections();
  const withPhotos = collections.map((collection) => ({
    ...collection,
    photos: getPhotos({ collectionId: collection.id, limit: 8 }),
  }));
  res.json(withPhotos);
});

publicCollectionsRouter.get('/:id', (req, res) => {
  const collection = getCollectionById(Number(req.params.id));
  if (!collection) {
    return res.status(404).json({ message: '未找到该系列' });
  }
  const photos = getPhotos({ collectionId: collection.id });
  res.json({ ...collection, photos });
});

export const adminCollectionsRouter = Router();

adminCollectionsRouter.post('/', (req, res) => {
  const parsed = collectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '参数校验失败', errors: parsed.error.flatten() });
  }
  const created = createCollection(parsed.data);
  res.status(201).json(created);
});

adminCollectionsRouter.put('/:id', (req, res) => {
  const parsed = collectionSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '参数校验失败', errors: parsed.error.flatten() });
  }
  const updated = updateCollection(Number(req.params.id), parsed.data);
  if (!updated) {
    return res.status(404).json({ message: '未找到该系列' });
  }
  res.json(updated);
});

adminCollectionsRouter.delete('/:id', (req, res) => {
  deleteCollection(Number(req.params.id));
  res.status(204).end();
});
