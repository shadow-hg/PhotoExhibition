import { useState } from 'react';
import clsx from 'clsx';
import { PhotoGrid } from './components/PhotoGrid';
import { PasswordDialog } from './components/PasswordDialog';
import { useSiteConfig } from './hooks/useSiteConfig';
import { useTrackView } from './hooks/useTrackView';

const downloadClass = clsx(
  'rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200',
  'hover:border-blue-500 hover:text-blue-400'
);

const downloadLinkClass = clsx(
  'block rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white',
  'hover:bg-blue-500'
);

function App() {
  const { config, loading, error } = useSiteConfig();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useTrackView('gallery');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 backdrop-blur bg-slate-950/70 border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{config?.title ?? 'Serverless Photo Gallery'}</h1>
            {config?.subtitle && (
              <p className="mt-1 text-sm text-slate-400">{config.subtitle}</p>
            )}
          </div>
          {config?.actions?.download && (
            <button
              type="button"
              className={downloadClass}
              onClick={() => {
                if (config.actions?.download.startsWith('http')) {
                  setDownloadUrl(config.actions.download);
                } else {
                  setShowPasswordDialog(true);
                }
              }}
            >
              下载合集
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10">
        {loading && <p className="text-slate-400">正在加载配置...</p>}
        {error && <p className="text-rose-400">配置加载失败：{error}</p>}
        {config && <PhotoGrid gallery={config.gallery} />}
      </main>

      {(showPasswordDialog || downloadUrl) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">下载作品</h2>
                <p className="text-sm text-slate-400">输入密码以获取临时下载链接。</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setDownloadUrl(null);
                }}
                className="rounded-full border border-transparent p-1 text-slate-400 hover:border-slate-700 hover:text-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mt-6">
              {downloadUrl ? (
                <a href={downloadUrl} className={downloadLinkClass}>
                  点击下载压缩包
                </a>
              ) : (
                <PasswordDialog
                  onSuccess={(url) => {
                    setDownloadUrl(url);
                    setShowPasswordDialog(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
