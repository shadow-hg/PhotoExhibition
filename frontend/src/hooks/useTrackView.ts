import { useEffect } from 'react';
import axios from 'axios';

export const useTrackView = (page: string) => {
  useEffect(() => {
    axios
      .post('/api/track', {
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
