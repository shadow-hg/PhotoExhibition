export interface Photo {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  location?: string | null;
  camera?: string | null;
  lens?: string | null;
  tags: string[];
  takenAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  palette?: string[];
  aspectRatio?: number | null;
  views: number;
  aiNotes?: string | null;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  coverPhotoId?: number | null;
  createdAt: string;
  heroImageUrl?: string | null;
  photos?: Photo[];
}

export interface Exhibition {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  heroImageUrl?: string | null;
  createdAt: string;
}

export interface GalleryStats {
  totalPhotos: number;
  featuredPhotos: number;
  totalCollections: number;
  totalExhibitions: number;
  totalViews: number;
  topTags: Array<{ tag: string; count: number }>;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  status: 'new' | 'replied' | 'archived';
}

export interface StatsResponse {
  stats: GalleryStats;
  latestPhotos: Photo[];
  featured: Photo[];
}

export interface BulkImportResult {
  totalFiles: number;
  imported: Photo[];
  skipped: Array<{ file: string; reason: string }>;
}
export type CollectionPayload = Partial<Collection> & { photoIds?: number[] };
export type PhotoPayload = Partial<Photo>;
export type ExhibitionPayload = Partial<Exhibition>;
