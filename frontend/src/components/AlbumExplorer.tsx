import { useMemo, useState } from 'react';
import type { Album, GalleryFilters, PhotoAsset } from '../types/gallery';

interface AlbumExplorerProps {
  albums: Album[];
  filters: GalleryFilters | null;
  onOpenAlbum: (album: Album) => void;
  onSelectPhoto: (photo: PhotoAsset) => void;
}

export function AlbumExplorer({ albums, filters, onOpenAlbum, onSelectPhoto }: AlbumExplorerProps) {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [location, setLocation] = useState('');
  const [year, setYear] = useState('');

  const filtered = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();
    return albums.filter((album) => {
      if (lowerSearch) {
        const haystack = [album.name, album.description, album.subtitle, ...(album.tags ?? [])]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(lowerSearch)) {
          return false;
        }
      }
      if (tag) {
        if (!(album.tags ?? []).some((candidate) => candidate.toLowerCase() === tag.toLowerCase())) {
          return false;
        }
      }
      if (location) {
        if (!(album.location ?? '').toLowerCase().includes(location.toLowerCase())) {
          return false;
        }
      }
      if (year) {
        const [start, end] = [album.dateRange?.start, album.dateRange?.end].map((value) =>
          value ? new Date(value).getUTCFullYear() : undefined
        );
        const yearNum = Number(year);
        if (Number.isFinite(yearNum)) {
          if (start && end) {
            if (yearNum < start || yearNum > end) return false;
          } else if (start && yearNum !== start) {
            return false;
          }
        }
      }
      return true;
    });
  }, [albums, search, tag, location, year]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">全部专题</h2>
          <p className="text-sm text-slate-400">按主题、地点或年份筛选感兴趣的系列</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索专题或关键词"
            className="w-full rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-3">
            <select
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className="rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="">标签</option>
              {(filters?.tags ?? []).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="">地点</option>
              {(filters?.locations ?? []).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="">年份</option>
              {(filters?.years ?? []).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {filtered.map((album) => (
          <article
            key={album.slug}
            className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/60 shadow-xl"
          >
            <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr,1fr]">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{album.location}</span>
                  {album.dateRange?.start && (
                    <span>
                      {album.dateRange.start.slice(0, 10)}
                      {album.dateRange?.end ? ` — ${album.dateRange.end.slice(0, 10)}` : ''}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">{album.name}</h3>
                  {album.subtitle && <p className="text-sm text-slate-400">{album.subtitle}</p>}
                </div>
                {album.description && <p className="text-sm text-slate-300">{album.description}</p>}
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  {(album.tags ?? []).map((item) => (
                    <span key={item} className="rounded-full border border-slate-700/60 px-3 py-1">
                      #{item}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenAlbum(album)}
                    className="rounded-full border border-blue-500/60 px-4 py-2 text-sm font-semibold text-blue-200 transition-colors hover:bg-blue-500/10"
                  >
                    查看专题
                  </button>
                  <span className="text-xs text-slate-500">共 {album.photos.length} 张作品</span>
                </div>
              </div>
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-3">
                {album.photos.slice(0, 4).map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => onSelectPhoto(photo)}
                    className="group relative overflow-hidden rounded-2xl border border-slate-800/60"
                  >
                    <img
                      src={photo.thumbnail}
                      alt={photo.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-950/0 transition-colors group-hover:bg-slate-950/40" />
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}
        {!filtered.length && (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-700/80 p-12 text-center text-slate-400">
            暂无符合筛选条件的专题，请尝试调整筛选条件。
          </div>
        )}
      </div>
    </section>
  );
}
