import HeroSection from '../components/HeroSection';
import StatsRibbon from '../components/StatsRibbon';
import CollectionsShowcase from '../components/CollectionsShowcase';
import MasonryGallery from '../components/MasonryGallery';
import ExhibitionTimeline from '../components/ExhibitionTimeline';
import ContactSection from '../components/ContactSection';
import Testimonials from '../components/Testimonials';
import { useCollections, useExhibitions, useGalleryStats, usePhotos } from '../api/hooks';

export default function HomePage() {
  const { data: stats } = useGalleryStats();
  const { data: collections } = useCollections();
  const { data: exhibitions } = useExhibitions();
  const { data: featured } = usePhotos({ featured: true, limit: 9 });

  return (
    <div className="space-y-0">
      <HeroSection data={stats} />
      <StatsRibbon data={stats} />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Gallery</p>
            <h2 className="mt-2 font-display text-3xl text-white">沉浸式精选</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              拾取旅途中最令人心动的光线，收藏那些值得停留的细节。点击图片即可全屏欣赏与分享。
            </p>
          </div>
          <a href="/gallery" className="text-sm font-semibold text-sky-300 hover:text-white">
            全部作品 →
          </a>
        </div>
        <div className="mt-10">
          <MasonryGallery photos={featured ?? stats?.latestPhotos} />
        </div>
      </section>
      <CollectionsShowcase collections={collections} />
      <ExhibitionTimeline exhibitions={exhibitions} />
      <Testimonials />
      <ContactSection />
    </div>
  );
}
