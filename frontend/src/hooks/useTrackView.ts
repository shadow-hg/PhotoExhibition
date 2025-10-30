import { useEffect } from 'react';
import { apiClient } from '../lib/httpClient';

export const useTrackView = (page: string) => {
  useEffect(() => {
    apiClient
      .post('/track', {
        page,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.debug('Failed to track view', error);
        }
      });
  }, [page]);
};
