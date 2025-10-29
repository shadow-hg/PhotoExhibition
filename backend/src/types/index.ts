export interface PhotoMetadata {
  id: string;
  title: string;
  description?: string;
  location?: string;
  captureTime?: string;
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutter?: string;
  focalLength?: string;
  ratio?: number;
  width: number;
  height: number;
  tags?: string[];
  src: string;
  thumbnail: string;
}

export interface GalleryGroup {
  name: string;
  slug?: string;
  cover?: string;
  description?: string;
  photos: PhotoMetadata[];
}

export interface SiteConfig {
  title: string;
  subtitle?: string;
  actions?: {
    download?: string;
  };
  gallery: GalleryGroup[];
  updatedAt: string;
}

export interface TrackPayload {
  page: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}
