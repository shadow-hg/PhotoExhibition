import clsx from 'clsx';
import type { GalleryStats, SiteManifest } from '../types/gallery';

interface GalleryHeroProps {
  manifest: SiteManifest;
  stats: GalleryStats | null;
  onDownloadClick: () => void;
}

const actionButtonClass = (type: 'primary' | 'secondary' | 'ghost' = 'secondary') =>
  clsx(
    'rounded-full px-5 py-2 text-sm font-semibold transition-colors',
    type === 'primary' && 'bg-white text-slate-900 hover:bg-slate-200',
    type === 'secondary' && 'border border-white/30 text-white hover:bg-white/10',
    type === 'ghost' && 'border border-slate-500/60 bg-slate-900/60 text-slate-100 hover:border-white/40'
  );

export function GalleryHero({ manifest, stats, onDownloadClick }: GalleryHeroProps) {
  const hero = manifest.site.hero;
  const primary = manifest.actions?.primary;
  const secondary = manifest.actions?.secondary;
  const download = manifest.actions?.download;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950 text-slate-50 shadow-xl">
      {hero.backgroundImage && (
        <div className="absolute inset-0">
          <img
            src={hero.backgroundImage}
            alt={hero.title}
            className="h-full w-full object-cover opacity-60"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/70 to-slate-900/80" />
        </div>
      )}
      <div className="relative z-10 grid gap-10 px-10 py-16 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-300">{manifest.site.subtitle}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {hero.title}
          </h1>
          {hero.tagline && <p className="text-lg text-slate-300">{hero.tagline}</p>}
          {hero.description && <p className="max-w-3xl text-base text-slate-200/90 lg:text-lg">{hero.description}</p>}
          {hero.highlight && (
            <div className="inline-flex items-center rounded-full border border-blue-400/60 bg-blue-500/20 px-4 py-1 text-sm font-medium text-blue-100">
              {hero.highlight}
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            {primary && (
              <a href={primary.href} className={actionButtonClass(primary.type ?? 'primary')}>
                {primary.label}
              </a>
            )}
            {secondary && (
              <a href={secondary.href} className={actionButtonClass(secondary.type ?? 'secondary')}>
                {secondary.label}
              </a>
            )}
            {download && (
              <button type="button" onClick={onDownloadClick} className={actionButtonClass(download.type ?? 'ghost')}>
                {download.label}
              </button>
            )}
          </div>
          {manifest.site.socials && manifest.site.socials.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-6 text-sm text-slate-300">
              {manifest.site.socials.map((social) => (
                <a key={social.href} href={social.href} className="flex items-center gap-2 hover:text-white">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-xs uppercase tracking-wide">
                    {social.icon ?? social.label[0]}
                  </span>
                  {social.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between gap-10 rounded-2xl border border-white/10 bg-slate-900/40 p-8">
          <div>
            <p className="text-sm text-slate-300">展馆简介</p>
            <p className="mt-3 text-base text-slate-200">{manifest.site.description}</p>
          </div>
          {stats && (
            <dl className="grid grid-cols-2 gap-6 text-center text-slate-100">
              <div>
                <dt className="text-sm text-slate-400">主题项目</dt>
                <dd className="text-3xl font-semibold">{stats.totalAlbums}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-400">精选作品</dt>
                <dd className="text-3xl font-semibold">{stats.totalPhotos}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-400">拍摄地点</dt>
                <dd className="text-3xl font-semibold">{stats.totalLocations}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-400">高赞瞬间</dt>
                <dd className="text-3xl font-semibold">{stats.favorites}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
