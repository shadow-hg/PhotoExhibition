import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useEffect } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { GalleryManager } from './pages/GalleryManager';
import { UploadPage } from './pages/UploadPage';
import { LogsPage } from './pages/LogsPage';
import { bootstrapAdminToken } from './services/api';

export const App = () => {
  useEffect(() => {
    bootstrapAdminToken();
  }, []);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#2563eb'
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="gallery" replace />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="logs" element={<LogsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};
