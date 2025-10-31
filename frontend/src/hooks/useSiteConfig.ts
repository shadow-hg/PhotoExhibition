import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import type { GalleryFilters, GalleryResponse, GalleryStats } from '../types/gallery';
import { getGallery } from '../lib/api';

interface UseGalleryResult {
  manifest: GalleryResponse['manifest'] | null;
  stats: GalleryStats | null;
  filters: GalleryFilters | null;
  featuredPhotos: GalleryResponse['featuredPhotos'];
  spotlightAlbums: GalleryResponse['spotlightAlbums'];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useSiteConfig = (): UseGalleryResult => {
  const [data, setData] = useState<GalleryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGallery();
      setData(response);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError((err as Error).message ?? '未知错误');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return useMemo(() => ({
    manifest: data?.manifest ?? null,
    stats: data?.stats ?? null,
    filters: data?.filters ?? null,
    featuredPhotos: data?.featuredPhotos ?? [],
    spotlightAlbums: data?.spotlightAlbums ?? [],
    loading,
    error,
    refresh: load
  }), [data, loading, error]);
};
