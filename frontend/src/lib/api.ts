import axios from 'axios';
import type { GalleryConfig, PhotoItem } from '../types/gallery';

export const getConfig = async () => {
  const { data } = await axios.get<GalleryConfig>('/api/getConfig');
  return data;
};

export const getPhotos = async (path: string) => {
  const { data } = await axios.get<{ photos: PhotoItem[] }>(`/api/getPhotos`, {
    params: { path }
  });
  return data.photos;
};

export const verifyDownloadPassword = async (password: string) => {
  const { data } = await axios.post<{ valid: boolean; url?: string }>(`/api/verify`, {
    password
  });
  return data;
};
