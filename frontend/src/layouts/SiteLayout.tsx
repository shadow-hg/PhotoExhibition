import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SiteLayout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
