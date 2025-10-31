import { Exhibition } from '../types/api';
import { format } from 'date-fns';

interface ExhibitionTimelineProps {
  exhibitions?: Exhibition[];
}

export default function ExhibitionTimeline({ exhibitions }: ExhibitionTimelineProps) {
  if (!exhibitions || exhibitions.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Immersive Events</p>
          <h2 className="mt-2 font-display text-3xl text-white">即将呈现</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            线下展览、跨界合作与艺术家分享，让影像与音乐、嗅觉、舞蹈共振。
          </p>
        </div>
        <a href="#contact" className="text-sm font-semibold text-sky-300 hover:text-white">
          预约现场体验 →
        </a>
      </div>
      <div className="relative mt-12">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-sky-500/40 via-white/10 to-transparent" />
        <div className="space-y-10">
          {exhibitions.map((exhibition) => (
            <div key={exhibition.id} className="relative ml-12 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-aurora">
              <span className="absolute left-[-52px] top-6 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 font-display text-sm text-white">
                {format(new Date(exhibition.startDate), 'MM')}
              </span>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{exhibition.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{exhibition.location}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {format(new Date(exhibition.startDate), 'yyyy.MM.dd')} — {format(new Date(exhibition.endDate), 'yyyy.MM.dd')}
                  </p>
                </div>
                {exhibition.heroImageUrl && (
                  <img
                    src={`${exhibition.heroImageUrl}&auto=format&fit=crop&w=800&q=80`}
                    alt={exhibition.title}
                    className="h-32 w-full rounded-2xl object-cover lg:w-64"
                  />
                )}
              </div>
              <p className="mt-4 text-sm text-slate-300">{exhibition.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
