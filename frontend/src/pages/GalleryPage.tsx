import { useMemo, useState } from 'react';
import { useCollections, useGalleryStats, usePhotos } from '../api/hooks';
import MasonryGallery from '../components/MasonryGallery';

export default function GalleryPage() {
  const { data: stats } = useGalleryStats();
  const { data: collections } = useCollections();
  const [filters, setFilters] = useState<{ collectionId?: number; tag?: string; search?: string }>({});
  const { data: photos, isLoading } = usePhotos(filters);

  const tagOptions = useMemo(() => stats?.stats.topTags ?? [], [stats]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Gallery Atlas</p>
        <h1 className="font-display text-4xl text-white">作品宇宙</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-400">
          用多维度的筛选方式探索作品，支持按主题系列、关键词、热门标签组合检索。
        </p>
      </header>

      <section className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-aurora md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">关键词搜索</label>
          <input
            type="text"
            placeholder="城市 / 星轨 / 自然..."
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value || undefined }))}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">主题系列</label>
          <select
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, collectionId: event.target.value ? Number(event.target.value) : undefined }))
            }
          >
            <option value="">全部</option>
            {collections?.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">热门标签</label>
          <select
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, tag: event.target.value || undefined }))
            }
          >
            <option value="">不限</option>
            {tagOptions.map((tag) => (
              <option key={tag.tag} value={tag.tag}>
                {tag.tag} · {tag.count}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-10">
        {isLoading ? (
          <p className="text-center text-sm text-slate-400">作品加载中...</p>
        ) : (
          <MasonryGallery photos={photos} />
        )}
      </section>
    </div>
  );
}
