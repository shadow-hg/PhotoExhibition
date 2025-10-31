import type { PhotoAsset } from '../types/gallery';

interface PhotoDetailDialogProps {
  photo: PhotoAsset | null;
  onClose: () => void;
}

const metadataEntries: Array<{ key: keyof PhotoAsset; label: string }> = [
  { key: 'camera', label: '相机' },
  { key: 'lens', label: '镜头' },
  { key: 'aperture', label: '光圈' },
  { key: 'shutter', label: '快门' },
  { key: 'iso', label: 'ISO' },
  { key: 'focalLength', label: '焦距' },
  { key: 'capturedAt', label: '拍摄时间' },
  { key: 'location', label: '拍摄地点' }
];

export function PhotoDetailDialog({ photo, onClose }: PhotoDetailDialogProps) {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4">
      <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950 text-slate-50 shadow-2xl lg:flex-row">
        <div className="max-h-[80vh] w-full flex-1 overflow-hidden bg-slate-900">
          <img src={photo.src} alt={photo.title} className="h-full w-full object-contain" loading="lazy" />
        </div>
        <div className="max-h-[80vh] w-full max-w-md overflow-y-auto border-t border-slate-800/60 bg-slate-900/70 p-6 lg:border-l lg:border-t-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">作品详情</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{photo.title}</h3>
              {photo.location && <p className="text-sm text-slate-400">{photo.location}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-transparent px-2 py-1 text-lg text-slate-400 transition hover:border-slate-600 hover:text-white"
            >
              ×
            </button>
          </div>
          {photo.description && <p className="mt-4 text-sm text-slate-300">{photo.description}</p>}
          {photo.tags && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
              {photo.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-700/60 px-3 py-1">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <dl className="mt-6 grid grid-cols-1 gap-4 text-sm text-slate-300">
            {metadataEntries.map(({ key, label }) => {
              const value = photo[key];
              if (!value) return null;
              return (
                <div key={key}>
                  <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</dt>
                  <dd className="mt-1 text-base text-slate-200">
                    {key === 'capturedAt' ? new Date(String(value)).toLocaleString() : String(value)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </div>
  );
}
