import { useExhibitions } from '../api/hooks';
import { format } from 'date-fns';
import ContactSection from '../components/ContactSection';

export default function ExhibitionsPage() {
  const { data: exhibitions } = useExhibitions();

  return (
    <div className="bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Live Experience</p>
          <h1 className="font-display text-4xl text-white">展览与活动</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            我期待与你在线下相遇。以下为正在筹备与巡展中的计划，欢迎携手策展人、音乐人、调香师创造跨界体验。
          </p>
        </header>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {exhibitions?.map((exhibition) => (
            <article key={exhibition.id} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-aurora">
              {exhibition.heroImageUrl && (
                <img
                  src={`${exhibition.heroImageUrl}&auto=format&fit=crop&w=1400&q=80`}
                  alt={exhibition.title}
                  className="h-56 w-full object-cover"
                />
              )}
              <div className="space-y-3 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-sky-300">{exhibition.location}</p>
                <h2 className="text-2xl font-semibold text-white">{exhibition.title}</h2>
                <p className="text-xs text-slate-500">
                  {format(new Date(exhibition.startDate), 'yyyy.MM.dd')} — {format(new Date(exhibition.endDate), 'yyyy.MM.dd')}
                </p>
                <p className="text-sm text-slate-300">{exhibition.description}</p>
                <a
                  href="#contact"
                  className="inline-flex items-center text-sm font-semibold text-sky-300 hover:text-white"
                >
                  联系合作 →
                </a>
              </div>
            </article>
          )) || <p className="text-sm text-slate-400">敬请期待最新展览。</p>}
        </div>
      </div>
      <ContactSection />
    </div>
  );
}
