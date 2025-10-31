import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

const navItems = [
  { name: '仪表盘', to: '/admin' },
  { name: '作品管理', to: '/admin/gallery' },
  { name: '系列管理', to: '/admin/collections' },
  { name: '展览与留言', to: '/admin/exhibitions' },
];

export default function AdminLayout() {
  const { token, username, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true });
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-display text-xl text-white">光影私语 · 管理后台</h1>
            <p className="text-xs text-slate-400">欢迎回来，{username}</p>
          </div>
          <button
            onClick={() => logout()}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
          >
            退出登录
          </button>
        </div>
        <nav className="border-t border-white/5">
          <div className="mx-auto flex max-w-6xl space-x-6 px-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `py-3 text-sm font-medium ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`
                }
                end={item.to === '/admin'}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
