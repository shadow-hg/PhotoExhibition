import { Router } from 'express';
import { z } from 'zod';
import { getMessages, recordMessage, updateMessageStatus } from '../services/galleryService';

const messageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
});

export const publicMessagesRouter = Router();

publicMessagesRouter.post('/', (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '参数校验失败', errors: parsed.error.flatten() });
  }
  const created = recordMessage(parsed.data);
  res.status(201).json(created);
});

export const adminMessagesRouter = Router();

adminMessagesRouter.get('/', (req, res) => {
  res.json(getMessages());
});

adminMessagesRouter.patch('/:id/status', (req, res) => {
  const schema = z.object({ status: z.enum(['new', 'replied', 'archived']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '参数校验失败', errors: parsed.error.flatten() });
  }
  const updated = updateMessageStatus(Number(req.params.id), parsed.data.status);
  res.json(updated);
});
