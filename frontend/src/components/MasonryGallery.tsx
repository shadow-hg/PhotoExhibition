import { Photo } from '../types/api';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

interface MasonryGalleryProps {
  photos?: Photo[];
}

export default function MasonryGallery({ photos }: MasonryGalleryProps) {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <PhotoProvider>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo) => (
          <figure key={photo.id} className="mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 shadow-aurora">
            <PhotoView src={photo.imageUrl}>
              <img
                src={`${photo.imageUrl}&auto=format&fit=crop&w=900&q=80`}
                alt={photo.title}
                className="w-full cursor-zoom-in object-cover transition duration-500 hover:scale-[1.03]"
                loading="lazy"
              />
            </PhotoView>
            <figcaption className="space-y-1 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{photo.title}</h3>
                {photo.isFeatured && <span className="text-[10px] uppercase tracking-widest text-sky-300">Featured</span>}
              </div>
              <p className="text-xs text-slate-400">{photo.location}</p>
              <div className="flex flex-wrap gap-1">
                {photo.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase tracking-widest text-slate-300">
                    #{tag}
                  </span>
                ))}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </PhotoProvider>
  );
}
