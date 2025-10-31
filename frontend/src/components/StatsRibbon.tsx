import { StatsResponse } from '../types/api';

interface StatsRibbonProps {
  data?: StatsResponse;
}

const fallbackStats = [
  { label: '作品', value: 48 },
  { label: '精选', value: 12 },
  { label: '展览', value: 6 },
  { label: '观众', value: '30K+' },
];

export default function StatsRibbon({ data }: StatsRibbonProps) {
  const stats = data
    ? [
        { label: '作品', value: data.stats.totalPhotos.toLocaleString() },
        { label: '精选', value: data.stats.featuredPhotos.toLocaleString() },
        { label: '展览', value: data.stats.totalExhibitions.toLocaleString() },
        { label: '累计观看', value: data.stats.totalViews.toLocaleString() },
      ]
    : fallbackStats;

  return (
    <section className="border-y border-white/5 bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-12 text-sm">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.4em] text-slate-500">{stat.label}</span>
            <span className="mt-2 font-display text-2xl text-white">{stat.value}</span>
          </div>
        ))}
        <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.4em] text-slate-300">
          Light-poem Studio · Storyteller Photographer
        </div>
      </div>
    </section>
  );
}
