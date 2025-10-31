export interface PhotoAsset {
  id: string;
  title: string;
  description?: string;
  story?: string;
  location?: string;
  capturedAt?: string;
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutter?: string;
  focalLength?: string;
  rating?: number;
  palette?: string[];
  tags?: string[];
  width: number;
  height: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  dominantColor?: string;
  src: string;
  thumbnail: string;
  hero?: boolean;
}

export interface AlbumStory {
  title: string;
  summary: string;
  highlighted?: boolean;
}

export interface AlbumCover {
  image: string;
  blurDataUrl?: string;
  color?: string;
  credit?: string;
}

export interface AlbumStats {
  totalPhotos?: number;
  totalFavorites?: number;
  totalLocations?: number;
  totalTags?: number;
}

export interface Album {
  slug: string;
  name: string;
  subtitle?: string;
  description?: string;
  cover: AlbumCover;
  theme?: 'light' | 'dark';
  location?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  tags?: string[];
  cameras?: string[];
  lenses?: string[];
  mood?: string[];
  spotlight?: string[];
  stats?: AlbumStats;
  photos: PhotoAsset[];
  stories?: AlbumStory[];
}

export interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  description?: string;
  album?: string;
  cover?: string;
  location?: string;
}

export interface SiteAction {
  label: string;
  href: string;
  type?: 'primary' | 'secondary' | 'ghost';
  requirePassword?: boolean;
  description?: string;
}

export interface SiteHero {
  title: string;
  tagline?: string;
  description?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  highlight?: string;
}

export interface SiteMeta {
  title: string;
  subtitle?: string;
  description?: string;
  hero: SiteHero;
  socials?: Array<{
    label: string;
    href: string;
    icon?: string;
  }>;
}

export interface GalleryStats {
  totalPhotos: number;
  totalAlbums: number;
  totalLocations: number;
  favorites: number;
  cameras: number;
  lenses: number;
  tags: number;
  updatedAt: string;
}

export interface GalleryFilters {
  tags: string[];
  locations: string[];
  cameras: string[];
  lenses: string[];
  years: number[];
}

export interface SiteManifest {
  site: SiteMeta;
  actions?: {
    primary?: SiteAction;
    secondary?: SiteAction;
    download?: SiteAction;
  };
  spotlight?: string[];
  featured?: string[];
  albums: Album[];
  timeline?: TimelineEntry[];
  updatedAt: string;
}

export interface GalleryResponse {
  manifest: SiteManifest;
  stats: GalleryStats;
  filters: GalleryFilters;
  featuredPhotos: PhotoAsset[];
  spotlightAlbums: Album[];
}

export interface TrackPayload {
  page: string;
  timestamp: string;
  event?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

export interface AdminDashboard {
  stats: GalleryStats & { totalStories: number };
  recentUploads: PhotoAsset[];
  highlightedAlbums: Array<Pick<Album, 'slug' | 'name' | 'cover' | 'stats'>>;
}
