import { usePhotos } from '../api/hooks';
import MasonryGallery from '../components/MasonryGallery';

export default function GalleryPage() {
  const { data: photos, isLoading } = usePhotos();

  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Gallery</p>
        <h1 className="font-display text-4xl text-white">全部作品</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-400">
          不再设置复杂的筛选，仅以原始的方式呈现每一张照片。耐心浏览，寻找与你共鸣的光影。
        </p>
      </header>

      <section className="mt-12">
        {isLoading ? (
          <p className="text-center text-sm text-slate-400">作品加载中...</p>
        ) : (
          <MasonryGallery photos={photos} />
        )}
      </section>
    </div>
  );
}
