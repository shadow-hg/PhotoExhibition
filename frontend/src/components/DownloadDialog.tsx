import { useEffect, useState } from 'react';
import type { SiteAction } from '../types/gallery';
import { requestDownloadLink } from '../lib/api';

interface DownloadDialogProps {
  action?: SiteAction;
  open: boolean;
  onClose: () => void;
}

export function DownloadDialog({ action, open, onClose }: DownloadDialogProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPassword('');
      setError(null);
      setDownloadUrl(null);
      if (action && !action.requirePassword) {
        setLoading(true);
        requestDownloadLink()
          .then((data) => {
            if (data.url) {
              setDownloadUrl(data.url);
            }
          })
          .catch((err) => setError(err.message ?? '获取下载链接失败'))
          .finally(() => setLoading(false));
      }
    }
  }, [open, action]);

  if (!open || !action) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await requestDownloadLink(password || undefined);
      if (result.valid && result.url) {
        setDownloadUrl(result.url);
      } else {
        setError('验证失败，请检查密码');
      }
    } catch (err) {
      setError((err as Error).message ?? '获取下载链接失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">{action.label}</h2>
            {action.description && <p className="mt-2 text-sm text-slate-300">{action.description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-transparent px-2 py-1 text-lg text-slate-400 transition hover:border-slate-600 hover:text-white"
          >
            ×
          </button>
        </div>

        {downloadUrl ? (
          <div className="mt-8 space-y-4 rounded-2xl border border-blue-500/40 bg-blue-500/10 p-6 text-slate-100">
            <p className="text-sm text-blue-100">链接将在浏览器新标签页中打开，请在 1 小时内完成下载。</p>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-blue-400"
            >
              前往下载
            </a>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {action.requirePassword && (
              <div className="space-y-2">
                <label htmlFor="download-password" className="text-sm text-slate-300">
                  输入下载密码
                </label>
                <input
                  id="download-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-full border border-slate-700/80 bg-slate-900 px-4 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                  placeholder="请输入密码"
                  required
                />
              </div>
            )}
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-700/80 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/80"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? '获取链接中...' : '获取下载链接'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
