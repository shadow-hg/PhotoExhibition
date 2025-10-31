import { Collection } from '../types/api';
import { motion } from 'framer-motion';

interface CollectionsShowcaseProps {
  collections?: Collection[];
}

export default function CollectionsShowcase({ collections }: CollectionsShowcaseProps) {
  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Curated Narratives</p>
          <h2 className="mt-2 font-display text-3xl text-white">主题系列</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            每个系列都是一次呼吸的旅程，从光影的细语到心跳的节奏，让观者在空间中漫游。
          </p>
        </div>
        <a href="/gallery" className="text-sm font-semibold text-sky-300 hover:text-white">
          查看全部系列 →
        </a>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {collections.slice(0, 3).map((collection, index) => (
          <motion.article
            key={collection.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 shadow-aurora"
          >
            {collection.heroImageUrl && (
              <img
                src={`${collection.heroImageUrl}&auto=format&fit=crop&w=1200&q=80`}
                alt={collection.name}
                className="h-48 w-full object-cover"
              />
            )}
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Collection #{index + 1}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{collection.name}</h3>
                <p className="mt-3 text-sm text-slate-300">{collection.description}</p>
              </div>
              {collection.photos && collection.photos.length > 0 && (
                <div className="mt-4 flex -space-x-3">
                  {collection.photos.slice(0, 3).map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="h-12 w-12 rounded-full border-2 border-slate-900 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
