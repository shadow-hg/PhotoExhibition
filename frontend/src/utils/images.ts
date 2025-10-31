const UNSPLASH_HOST = 'images.unsplash.com';

type ImageOptions = {
  width?: number;
  quality?: number;
  fit?: 'crop' | 'max' | 'clip' | 'fill';
};

export function buildImageSrc(src?: string | null, options: ImageOptions = {}): string {
  if (!src) {
    return '';
  }

  const trimmed = src.trim();
  if (!trimmed) {
    return '';
  }

  const isUnsplash = /^https?:\/\//i.test(trimmed) && trimmed.includes(UNSPLASH_HOST);
  if (!isUnsplash) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (!url.searchParams.has('auto')) {
      url.searchParams.append('auto', 'format');
    }
    if (options.fit && !url.searchParams.has('fit')) {
      url.searchParams.set('fit', options.fit);
    }
    if (options.width && !url.searchParams.has('w')) {
      url.searchParams.set('w', String(options.width));
    }
    if (options.quality && !url.searchParams.has('q')) {
      url.searchParams.set('q', String(options.quality));
    }
    return url.toString();
  } catch {
    return trimmed;
  }
}
