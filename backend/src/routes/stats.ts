import { Router } from 'express';
import { getGalleryStats, getPhotos } from '../services/galleryService';

const router = Router();

router.get('/', (req, res) => {
  const stats = getGalleryStats();
  const latestPhotos = getPhotos({ limit: 6 });
  const featured = getPhotos({ featured: true, limit: 6 });
  res.json({ stats, latestPhotos, featured });
});

export default router;
