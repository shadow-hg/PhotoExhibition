import { useEffect } from 'react';
import { apiClient } from '../lib/httpClient';

interface TrackOptions {
  page: string;
  event?: string;
  metadata?: Record<string, unknown>;
}

export const useTrackView = ({ page, event = 'view', metadata }: TrackOptions) => {
  useEffect(() => {
    apiClient
      .post('/track', {
        page,
        event,
        metadata,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.debug('Failed to track event', error);
        }
      });
  }, [page, event, metadata && JSON.stringify(metadata)]);
};
