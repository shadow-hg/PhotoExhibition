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
          <figure
            key={photo.id}
            className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40"
          >
            <PhotoView src={photo.imageUrl}>
              <img
                src={`${photo.imageUrl}&auto=format&fit=crop&w=900&q=80`}
                alt={photo.title}
                className="w-full cursor-zoom-in object-cover"
                loading="lazy"
              />
            </PhotoView>
            <figcaption className="space-y-1 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">{photo.title}</h3>
              {photo.location && <p className="text-xs text-slate-400">{photo.location}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
    </PhotoProvider>
  );
}
