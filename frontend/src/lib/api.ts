import type { GalleryConfig, PhotoItem } from '../types/gallery';
import { apiClient } from './httpClient';

export const getConfig = async () => {
  const { data } = await apiClient.get<GalleryConfig>('/getConfig');
  return data;
};

export const getPhotos = async (path: string) => {
  const { data } = await apiClient.get<{ photos: PhotoItem[] }>('/getPhotos', {
    params: { path }
  });
  return data.photos;
};

export const verifyDownloadPassword = async (password: string) => {
  const { data } = await apiClient.post<{ valid: boolean; url?: string }>('/verify', {
    password
  });
  return data;
};
