import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import {
  BulkImportResult,
  Collection,
  CollectionPayload,
  ContactMessage,
  Exhibition,
  Photo,
  PhotoPayload,
  ExhibitionPayload,
  StatsResponse,
} from '../types/api';

export function usePhotos(params?: Record<string, any>) {
  return useQuery<Photo[]>({
    queryKey: ['photos', params],
    queryFn: async () => {
      const response = await apiClient.get<Photo[]>('/photos', { params });
      return response.data;
    },
  });
}

export function usePhoto(id: number | string | undefined) {
  return useQuery<Photo | null>({
    queryKey: ['photo', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await apiClient.get<Photo>(`/photos/${id}`);
      return response.data;
    },
  });
}

export function useCollections() {
  return useQuery<Collection[]>({
    queryKey: ['collections'],
    queryFn: async () => {
      const response = await apiClient.get<Collection[]>('/collections');
      return response.data;
    },
  });
}

export function useExhibitions() {
  return useQuery<Exhibition[]>({
    queryKey: ['exhibitions'],
    queryFn: async () => {
      const response = await apiClient.get<Exhibition[]>('/exhibitions');
      return response.data;
    },
  });
}

export function useGalleryStats() {
  return useQuery<StatsResponse>({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await apiClient.get<StatsResponse>('/stats');
      return response.data;
    },
  });
}

export function useContactMutation() {
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; message: string }) => {
      const response = await apiClient.post('/messages', payload);
      return response.data;
    },
  });
}

export function useAdminMessages() {
  return useQuery<ContactMessage[]>({
    queryKey: ['admin', 'messages'],
    queryFn: async () => {
      const response = await apiClient.get<ContactMessage[]>('/admin/messages');
      return response.data;
    },
  });
}

export function useAdminUpdateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: ContactMessage['status'] }) => {
      const response = await apiClient.patch<ContactMessage>(`/admin/messages/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
    },
  });
}

export function useAdminCreatePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PhotoPayload) => {
      const response = await apiClient.post<Photo>('/admin/photos', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useAdminUpdatePhoto(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PhotoPayload) => {
      const response = await apiClient.put<Photo>(`/admin/photos/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['photo', id] });
    },
  });
}

export function useAdminDeletePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/photos/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useAdminImportLocalPhotos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<BulkImportResult>('/admin/photos/import-local');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useAdminCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CollectionPayload) => {
      const response = await apiClient.post<Collection>('/admin/collections', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useAdminUpdateCollection(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CollectionPayload) => {
      const response = await apiClient.put<Collection>(`/admin/collections/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useAdminDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/collections/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

export function useAdminCreateExhibition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ExhibitionPayload) => {
      const response = await apiClient.post<Exhibition>('/admin/exhibitions', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibitions'] });
    },
  });
}

export function useAdminUpdateExhibition(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ExhibitionPayload) => {
      const response = await apiClient.put<Exhibition>(`/admin/exhibitions/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibitions'] });
    },
  });
}

export function useAdminDeleteExhibition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/exhibitions/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibitions'] });
    },
  });
}
