import { useEffect, useState } from 'react';
import { fetchConfig, updateConfig } from '../services/api';
import type { SiteConfig } from '../types';

export const useAdminConfig = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig()
      .then(setConfig)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async (next: SiteConfig) => {
    const saved = await updateConfig(next);
    setConfig(saved);
    return saved;
  };

  return { config, loading, error, save, setConfig } as const;
};
