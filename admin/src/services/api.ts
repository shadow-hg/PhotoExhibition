import axios from 'axios';
import type { AdminDashboard, GalleryResponse, PhotoAsset, SiteManifest, LogEntry } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const ADMIN_API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL ?? '/api/admin';

const client = axios.create({
  baseURL: API_BASE_URL
});

const adminClient = axios.create({
  baseURL: ADMIN_API_BASE_URL
});

export const setAdminToken = (token: string) => {
  if (token) {
    adminClient.defaults.headers.common['x-admin-token'] = token;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('admin-token', token);
    }
  } else {
    delete adminClient.defaults.headers.common['x-admin-token'];
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('admin-token');
    }
  }
};

export const bootstrapAdminToken = () => {
  if (typeof window === 'undefined') return;
  const stored = window.localStorage.getItem('admin-token');
  if (stored) {
    adminClient.defaults.headers.common['x-admin-token'] = stored;
  }
};

export const loginAsAdmin = async (password: string) => {
  const { data } = await client.post<{ token: string; expiresAt: string }>('/admin/login', { password });
  return data;
};

export const fetchManifest = async () => {
  const { data } = await client.get<GalleryResponse>('/gallery/manifest');
  return data.manifest;
};

export const updateManifest = async (manifest: SiteManifest) => {
  const { data } = await adminClient.post<SiteManifest>('/manifest', manifest);
  return data;
};

export const triggerUploadProcessing = async (objectKey: string) => {
  const { data } = await adminClient.post<PhotoAsset>('/upload', { objectKey });
  return data;
};

export const fetchDashboard = async () => {
  const { data } = await adminClient.get<AdminDashboard>('/dashboard');
  return data;
};

export const fetchLogs = async () => {
  const { data } = await adminClient.get<{ logs: LogEntry[] }>('/logs');
  return data.logs;
};
