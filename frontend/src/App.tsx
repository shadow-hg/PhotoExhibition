import { Routes, Route, Navigate } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import ExhibitionsPage from './pages/ExhibitionsPage';
import AboutPage from './pages/AboutPage';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminGallery from './pages/AdminGallery';
import AdminCollections from './pages/AdminCollections';
import AdminExhibitions from './pages/AdminExhibitions';
import { AuthProvider } from './hooks/useAuth';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="exhibitions" element={<ExhibitionsPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="exhibitions" element={<AdminExhibitions />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
