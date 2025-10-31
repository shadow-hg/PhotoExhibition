import { Router } from 'express';
import { z } from 'zod';
import {
  createExhibition,
  deleteExhibition,
  getExhibitionById,
  getExhibitions,
  updateExhibition,
} from '../services/galleryService';

const exhibitionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  heroImageUrl: z.string().url().optional().nullable(),
});

export const publicExhibitionsRouter = Router();

publicExhibitionsRouter.get('/', (req, res) => {
  res.json(getExhibitions());
});

publicExhibitionsRouter.get('/:id', (req, res) => {
  const exhibition = getExhibitionById(Number(req.params.id));
  if (!exhibition) {
    return res.status(404).json({ message: '未找到展览信息' });
  }
  res.json(exhibition);
});

export const adminExhibitionsRouter = Router();

adminExhibitionsRouter.post('/', (req, res) => {
  const parsed = exhibitionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '参数校验失败', errors: parsed.error.flatten() });
  }
  const created = createExhibition(parsed.data);
  res.status(201).json(created);
});

adminExhibitionsRouter.put('/:id', (req, res) => {
  const parsed = exhibitionSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '参数校验失败', errors: parsed.error.flatten() });
  }
  const updated = updateExhibition(Number(req.params.id), parsed.data);
  if (!updated) {
    return res.status(404).json({ message: '未找到展览信息' });
  }
  res.json(updated);
});

adminExhibitionsRouter.delete('/:id', (req, res) => {
  deleteExhibition(Number(req.params.id));
  res.status(204).end();
});
