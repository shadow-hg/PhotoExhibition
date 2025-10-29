import { useEffect, useRef, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import type { GalleryGroup, PhotoItem } from '../types/gallery';
import { formatExif } from '../lib/exif';

interface PhotoGridProps {
  gallery: GalleryGroup[];
}

const useIntersection = <T extends Element>() => {
  const [isVisible, setIsVisible] = useState(false);
  const observer = useRef<IntersectionObserver>();
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!ref.current) return undefined;

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.current?.disconnect();
        }
      });
    });

    observer.current.observe(ref.current);

    return () => observer.current?.disconnect();
  }, []);

  return { ref, isVisible };
};

const PhotoCard = ({ photo }: { photo: PhotoItem }) => {
  const { ref, isVisible } = useIntersection<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);
  const exifText = formatExif(photo);

  return (
    <div ref={ref} className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-lg">
      {isVisible && (
        <PhotoView src={photo.src}>
          <img
            src={photo.thumbnail}
            data-full={photo.src}
            className={`lazy-image ${loaded ? 'loaded' : ''} h-full w-full object-cover`}
            alt={photo.title}
            onLoad={() => setLoaded(true)}
          />
        </PhotoView>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-sm">
        <p className="font-semibold text-slate-100">{photo.title}</p>
        {photo.captureTime && <p className="text-xs text-slate-400">{photo.captureTime}</p>}
        {photo.location && <p className="text-xs text-slate-400">{photo.location}</p>}
        {exifText && <p className="mt-1 text-xs text-slate-400/80">{exifText}</p>}
      </div>
    </div>
  );
};

export const PhotoGrid = ({ gallery }: PhotoGridProps) => {
  return (
    <PhotoProvider
      speed={() => 320}
      easing={(type) => (type === 2 ? 'cubic-bezier(0.36,0,0.66,-0.56)' : 'cubic-bezier(0.34,1.56,0.64,1)')}
    >
      <div className="space-y-16">
        {gallery.map((group) => (
          <section key={group.name} className="space-y-6">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{group.name}</h2>
                {group.description && <p className="text-sm text-slate-400">{group.description}</p>}
              </div>
              {group.cover && (
                <img
                  src={group.cover}
                  alt={`${group.name} cover`}
                  className="h-20 w-20 rounded-full border border-slate-800 object-cover"
                />
              )}
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.photos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PhotoProvider>
  );
};
