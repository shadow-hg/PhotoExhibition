import { useEffect, useState } from 'react';
import axios from 'axios';
import type { GalleryConfig } from '../types/gallery';

interface UseSiteConfigResult {
  config: GalleryConfig | null;
  loading: boolean;
  error: string | null;
}

export const useSiteConfig = (): UseSiteConfigResult => {
  const [config, setConfig] = useState<GalleryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get<GalleryConfig>('/api/getConfig', { signal: controller.signal })
      .then((response) => {
        setConfig(response.data);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError(err.message ?? '未知错误');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { config, loading, error };
};
