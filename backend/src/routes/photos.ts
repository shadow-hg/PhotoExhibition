import { Router } from 'express';
import { z } from 'zod';
import {
  createPhoto,
  deletePhoto,
  getPhotoById,
  getPhotos,
  incrementPhotoView,
  updatePhoto,
} from '../services/galleryService';

const photoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url(),
  location: z.string().optional().nullable(),
  camera: z.string().optional().nullable(),
  lens: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  takenAt: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  palette: z.array(z.string()).optional(),
  aspectRatio: z.number().positive().optional(),
  views: z.number().int().nonnegative().optional(),
  aiNotes: z.string().optional().nullable(),
});

export const publicPhotosRouter = Router();

publicPhotosRouter.get('/', (req, res) => {
  const { featured, collectionId, tag, search, limit, offset } = req.query;
  const photos = getPhotos({
    featured: featured !== undefined ? featured === 'true' : undefined,
    collectionId: collectionId ? Number(collectionId) : undefined,
    tag: tag ? String(tag) : undefined,
    search: search ? String(search) : undefined,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
  });
  res.json(photos);
});

publicPhotosRouter.get('/:id', (req, res) => {
  const photo = getPhotoById(Number(req.params.id));
  if (!photo) {
    return res.status(404).json({ message: '未找到该作品' });
  }
  res.json(photo);
});

publicPhotosRouter.post('/:id/view', (req, res) => {
  incrementPhotoView(Number(req.params.id));
  res.status(204).end();
});

export const adminPhotosRouter = Router();

adminPhotosRouter.post('/', (req, res) => {
  const parsed = photoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '参数校验失败', errors: parsed.error.flatten() });
  }

  const photo = createPhoto(parsed.data);
  res.status(201).json(photo);
});

adminPhotosRouter.put('/:id', (req, res) => {
  const parsed = photoSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '参数校验失败', errors: parsed.error.flatten() });
  }

  const updated = updatePhoto(Number(req.params.id), parsed.data);
  if (!updated) {
    return res.status(404).json({ message: '未找到该作品' });
  }
  res.json(updated);
});

adminPhotosRouter.delete('/:id', (req, res) => {
  deletePhoto(Number(req.params.id));
  res.status(204).end();
});
