import type { GalleryResponse, SearchResultItem, SiteManifest } from '../types/gallery';
import { apiClient } from './httpClient';

export const getGallery = async () => {
  const { data } = await apiClient.get<GalleryResponse>('/gallery/manifest');
  return data;
};

export const getAlbumDetail = async (slug: string) => {
  const { data } = await apiClient.get<{
    album: SiteManifest['albums'][number];
    stats: {
      totalPhotos: number;
      totalFavorites: number;
      totalLocations: number;
      totalTags: number;
    };
    relatedAlbums: SiteManifest['albums'];
    featuredPhotos: SiteManifest['albums'][number]['photos'];
  }>(`/gallery/albums/${slug}`);
  return data;
};

export const getPhotoDetail = async (id: string) => {
  const { data } = await apiClient.get(`/gallery/photos/${id}`);
  return data as { photo: SiteManifest['albums'][number]['photos'][number]; album: SiteManifest['albums'][number] | undefined };
};

export interface SearchParams {
  q?: string;
  tag?: string;
  camera?: string;
  location?: string;
  year?: number;
  limit?: number;
}

export const searchGallery = async (params: SearchParams) => {
  const { data } = await apiClient.get<{ total: number; results: SearchResultItem[] }>('/gallery/search', {
    params
  });
  return data;
};

export const requestDownloadLink = async (password?: string) => {
  const { data } = await apiClient.post<{ valid: boolean; url?: string; description?: string }>(
    '/gallery/download-link',
    password ? { password } : {}
  );
  return data;
};
