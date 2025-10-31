import type { Album } from '../types/gallery';

interface SpotlightAlbumsProps {
  albums: Album[];
  onOpen: (album: Album) => void;
}

export function SpotlightAlbums({ albums, onOpen }: SpotlightAlbumsProps) {
  if (!albums.length) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">焦点专题</h2>
          <p className="text-sm text-slate-400">正在展出的系列与热门专题</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {albums.map((album) => (
          <button
            key={album.slug}
            type="button"
            onClick={() => onOpen(album)}
            className="group relative overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 text-left shadow-xl transition-transform hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={album.cover.image}
                alt={album.name}
                className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-300">{album.location}</span>
                <h3 className="text-2xl font-semibold text-white">{album.name}</h3>
                {album.subtitle && <p className="text-sm text-slate-300">{album.subtitle}</p>}
              </div>
            </div>
            <div className="space-y-4 px-5 py-5 text-sm text-slate-300">
              {album.description && <p className="line-clamp-3 text-slate-300/90">{album.description}</p>}
              <div className="flex flex-wrap gap-2">
                {(album.tags ?? []).slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-700/60 px-3 py-1 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
              {album.dateRange && (
                <p className="text-xs text-slate-500">
                  {album.dateRange.start?.slice(0, 10)} — {album.dateRange.end?.slice(0, 10)}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
