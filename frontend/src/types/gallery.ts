export interface PhotoItem {
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
  tags?: string[];
  src: string;
  thumbnail: string;
  width: number;
  height: number;
}

export interface GalleryGroup {
  name: string;
  slug?: string;
  cover?: string;
  description?: string;
  photos: PhotoItem[];
}

export interface GalleryConfig {
  title: string;
  subtitle?: string;
  actions?: {
    download?: string;
  };
  gallery: GalleryGroup[];
  updatedAt: string;
}
