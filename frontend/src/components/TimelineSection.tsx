import type { SiteManifest } from '../types/gallery';

interface TimelineSectionProps {
  timeline: NonNullable<SiteManifest['timeline']>;
  onOpenAlbum: (slug: string) => void;
}

export function TimelineSection({ timeline, onOpenAlbum }: TimelineSectionProps) {
  if (!timeline.length) return null;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">项目年表</h2>
        <p className="text-sm text-slate-400">回顾每个专题的关键节点与展览历程</p>
      </div>
      <ol className="relative space-y-8 border-l border-slate-800/70 pl-6">
        {timeline.map((entry) => (
          <li key={entry.id} className="relative ml-2">{/* offset to align marker */}
            <span className="absolute -left-3 top-1 h-3 w-3 rounded-full border border-blue-300 bg-blue-500" />
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 shadow-lg">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>{new Date(entry.date).toLocaleDateString()}</span>
                {entry.location && (
                  <span className="rounded-full border border-slate-700/60 px-3 py-1">{entry.location}</span>
                )}
                {entry.album && (
                  <button
                    type="button"
                    onClick={() => onOpenAlbum(entry.album!)}
                    className="rounded-full border border-blue-500/60 px-3 py-1 text-blue-200 hover:bg-blue-500/10"
                  >
                    查看相关专题
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{entry.title}</h3>
                {entry.description && <p className="mt-2 text-sm text-slate-300">{entry.description}</p>}
              </div>
              {entry.cover && (
                <div className="overflow-hidden rounded-2xl border border-slate-800/60">
                  <img
                    src={entry.cover}
                    alt={entry.title}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
