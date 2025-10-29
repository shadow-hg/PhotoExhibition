import axios from 'axios';
import type { SiteConfig, PhotoMetadata, LogEntry } from '../types';

const client = axios.create({
  baseURL: '/api'
});

const adminClient = axios.create({
  baseURL: '/api/admin'
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

export const fetchConfig = async () => {
  const { data } = await client.get<SiteConfig>('/getConfig');
  return data;
};

export const updateConfig = async (config: SiteConfig) => {
  const { data } = await adminClient.post<SiteConfig>('/updateConfig', config);
  return data;
};

export const triggerUploadProcessing = async (objectKey: string) => {
  const { data } = await adminClient.post<PhotoMetadata>('/upload', { objectKey });
  return data;
};

export const fetchLogs = async () => {
  const { data } = await adminClient.get<{ logs: LogEntry[] }>('/listLogs');
  return data.logs;
};
