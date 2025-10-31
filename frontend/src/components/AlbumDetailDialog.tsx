import type { Album } from '../types/gallery';

interface AlbumDetailDialogProps {
  album: Album | null;
  onClose: () => void;
  onSelectPhoto: (photoId: string) => void;
}

export function AlbumDetailDialog({ album, onClose, onSelectPhoto }: AlbumDetailDialogProps) {
  if (!album) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950 text-slate-50 shadow-2xl lg:flex-row">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">专题介绍</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{album.name}</h2>
              {album.subtitle && <p className="text-sm text-slate-400">{album.subtitle}</p>}
              {album.location && <p className="mt-2 text-sm text-slate-400">拍摄地点：{album.location}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-transparent px-2 py-1 text-lg text-slate-400 transition hover:border-slate-600 hover:text-white"
            >
              ×
            </button>
          </div>
          {album.description && <p className="mt-6 text-sm leading-relaxed text-slate-300">{album.description}</p>}
          {album.stories && album.stories.length > 0 && (
            <div className="mt-6 space-y-4 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-slate-200">创作故事</h3>
              <div className="space-y-3 text-sm text-slate-300">
                {album.stories.map((story) => (
                  <div key={story.title} className="space-y-1">
                    <p className="font-medium text-slate-100">{story.title}</p>
                    <p className="text-slate-300">{story.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-300">
            {(album.tags ?? []).map((tag) => (
              <span key={tag} className="rounded-full border border-slate-700/60 px-3 py-1">
                #{tag}
              </span>
            ))}
            {(album.cameras ?? []).map((camera) => (
              <span key={camera} className="rounded-full border border-slate-700/60 px-3 py-1">
                {camera}
              </span>
            ))}
          </div>
        </div>
        <div className="max-h-[80vh] w-full max-w-md overflow-y-auto border-t border-slate-800/60 bg-slate-900/60 p-6 lg:border-l lg:border-t-0">
          <h3 className="text-sm font-semibold text-slate-200">全部作品</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {album.photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => onSelectPhoto(photo.id)}
                className="group relative overflow-hidden rounded-2xl border border-slate-800/60"
              >
                <img
                  src={photo.thumbnail}
                  alt={photo.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-950/0 transition-colors group-hover:bg-slate-950/40" />
                <span className="absolute bottom-2 left-2 text-xs font-medium text-slate-100 drop-shadow">{photo.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
