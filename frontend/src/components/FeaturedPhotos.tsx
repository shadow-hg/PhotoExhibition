import type { PhotoAsset } from '../types/gallery';

interface FeaturedPhotosProps {
  photos: PhotoAsset[];
  onSelect: (photo: PhotoAsset) => void;
}

export function FeaturedPhotos({ photos, onSelect }: FeaturedPhotosProps) {
  if (!photos.length) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">精选瞬间</h2>
          <p className="text-sm text-slate-400">从全部作品中挑选的高光时刻</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => onSelect(photo)}
            className="group relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/60 text-left shadow-lg transition-transform hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={photo.src}
                alt={photo.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="space-y-3 px-5 py-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{photo.location ?? '未知地点'}</span>
                {photo.capturedAt && <span>{new Date(photo.capturedAt).toLocaleDateString()}</span>}
              </div>
              <h3 className="text-lg font-semibold text-slate-50">{photo.title}</h3>
              {photo.description && <p className="line-clamp-2 text-sm text-slate-400">{photo.description}</p>}
              {photo.tags && (
                <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-300">
                  {photo.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-600/60 px-3 py-1">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
