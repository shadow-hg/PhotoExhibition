import MasonryGallery from '../components/MasonryGallery';
import { usePhotos } from '../api/hooks';

export default function HomePage() {
  const { data: photos, isLoading } = usePhotos({ limit: 12 });

  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Photo Collection</p>
        <h1 className="font-display text-4xl text-white">光影私语 · 作品选</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-400">
          以极简方式呈现旅途中捕捉的光与影。点击任意照片即可进入全屏查看，静静欣赏画面里的情绪。
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
