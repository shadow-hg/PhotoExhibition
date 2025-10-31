import { motion } from 'framer-motion';
import { StatsResponse } from '../types/api';
import { Link } from 'react-router-dom';
import { buildImageSrc } from '../utils/images';

interface HeroSectionProps {
  data?: StatsResponse;
}

export default function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.4),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(196,181,253,0.35),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.25),transparent_55%)] opacity-80" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-28 lg:flex-row lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-200">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            全感官摄影体验
          </span>
          <h1 className="mt-6 font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            用一场沉浸式的旅程，
            <br />
            与光影对话。
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            我相信摄影不仅是捕捉瞬间，更是与观者共享呼吸的艺术。跟随我的镜头，探索城市、自然与心灵的律动。
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/gallery"
              className="rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-aurora transition hover:scale-[1.02]"
            >
              浏览作品集
            </Link>
            <a
              href="#contact"
              className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-sky-400 hover:text-white"
            >
              定制合作
            </a>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="grid w-full gap-4 sm:grid-cols-2"
        >
          {data?.featured.slice(0, 4).map((photo, index) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5"
            >
              <img
                src={buildImageSrc(photo.imageUrl, { width: 800, quality: 80, fit: 'crop' })}
                alt={photo.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-300">精选 #{index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{photo.title}</h3>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
