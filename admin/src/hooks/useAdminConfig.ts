import { useEffect, useState } from 'react';
import { fetchManifest, updateManifest } from '../services/api';
import type { SiteManifest } from '../types';

export const useAdminConfig = () => {
  const [manifest, setManifest] = useState<SiteManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchManifest()
      .then(setManifest)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async (next: SiteManifest) => {
    const saved = await updateManifest(next);
    setManifest(saved);
    return saved;
  };

  return { manifest, loading, error, save, setManifest } as const;
};
