import { Router } from 'express';
import { adminCollectionsRouter, publicCollectionsRouter } from './collections';
import { adminExhibitionsRouter, publicExhibitionsRouter } from './exhibitions';
import { adminMessagesRouter, publicMessagesRouter } from './messages';
import { adminPhotosRouter, publicPhotosRouter } from './photos';
import authRouter from './auth';
import statsRouter from './stats';
import { requireAuth } from '../middleware/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? 'photo_exhibition_secret';

router.use('/auth', authRouter);
router.use('/stats', statsRouter);
router.use('/photos', publicPhotosRouter);
router.use('/collections', publicCollectionsRouter);
router.use('/exhibitions', publicExhibitionsRouter);
router.use('/messages', publicMessagesRouter);

const adminRouter = Router();
adminRouter.use(requireAuth(JWT_SECRET));
adminRouter.use('/photos', adminPhotosRouter);
adminRouter.use('/collections', adminCollectionsRouter);
adminRouter.use('/exhibitions', adminExhibitionsRouter);
adminRouter.use('/messages', adminMessagesRouter);

router.use('/admin', adminRouter);

export default router;
