import type {
  AdminDashboard,
  Album,
  GalleryFilters,
  GalleryResponse,
  GalleryStats,
  PhotoAsset,
  SiteManifest
} from '../types';

const collectPhotos = (manifest: SiteManifest): PhotoAsset[] =>
  manifest.albums.flatMap((album) => album.photos ?? []);

const uniqueSorted = (values: Array<string | undefined>) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b));

const parseYear = (date?: string) => {
  if (!date) return undefined;
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return undefined;
  return value.getUTCFullYear();
};

const buildStats = (manifest: SiteManifest): GalleryStats => {
  const photos = collectPhotos(manifest);
  const locations = uniqueSorted(photos.map((photo) => photo.location));
  const cameras = uniqueSorted(photos.map((photo) => photo.camera));
  const lenses = uniqueSorted(photos.map((photo) => photo.lens));
  const tags = Array.from(
    new Set(
      photos
        .flatMap((photo) => photo.tags ?? [])
        .filter((tag): tag is string => Boolean(tag))
        .map((tag) => tag.toLowerCase())
    )
  ).sort((a, b) => a.localeCompare(b));

  const favorites = photos.filter((photo) => photo.hero || (photo.rating ?? 0) >= 4).length;

  return {
    totalPhotos: photos.length,
    totalAlbums: manifest.albums.length,
    totalLocations: locations.length,
    favorites,
    cameras: cameras.length,
    lenses: lenses.length,
    tags: tags.length,
    updatedAt: manifest.updatedAt
  };
};

const buildFilters = (manifest: SiteManifest): GalleryFilters => {
  const photos = collectPhotos(manifest);
  return {
    tags: Array.from(
      new Set(
        photos.flatMap((photo) => photo.tags ?? []).map((tag) => tag?.toLowerCase()).filter((tag): tag is string => Boolean(tag))
      )
    ).sort((a, b) => a.localeCompare(b)),
    locations: uniqueSorted(photos.map((photo) => photo.location)),
    cameras: uniqueSorted(photos.map((photo) => photo.camera)),
    lenses: uniqueSorted(photos.map((photo) => photo.lens)),
    years: Array.from(
      new Set(photos.map((photo) => parseYear(photo.capturedAt)).filter((value): value is number => typeof value === 'number'))
    ).sort((a, b) => a - b)
  };
};

const findPhotoMap = (manifest: SiteManifest) => {
  const map = new Map<string, { album: Album; photo: PhotoAsset }>();
  for (const album of manifest.albums) {
    for (const photo of album.photos ?? []) {
      map.set(photo.id, { album, photo });
    }
  }
  return map;
};

export const findAlbumBySlug = (manifest: SiteManifest, slug: string) =>
  manifest.albums.find((album) => album.slug.toLowerCase() === slug.toLowerCase());

export const findPhotoById = (manifest: SiteManifest, id: string) => findPhotoMap(manifest).get(id)?.photo;

export const resolveFeaturedPhotos = (manifest: SiteManifest): PhotoAsset[] => {
  const map = findPhotoMap(manifest);
  const ids = manifest.featured ?? [];
  const photos: PhotoAsset[] = [];
  for (const id of ids) {
    const entry = map.get(id);
    if (entry) {
      photos.push(entry.photo);
    }
  }
  if (!photos.length) {
    return Array.from(map.values())
      .map((entry) => entry.photo)
      .filter((photo) => photo.hero)
      .slice(0, 6);
  }
  return photos;
};

export const resolveSpotlightAlbums = (manifest: SiteManifest): Album[] => {
  const slugs = manifest.spotlight ?? [];
  const matches = slugs
    .map((slug) => findAlbumBySlug(manifest, slug))
    .filter((album): album is Album => Boolean(album));
  if (matches.length) {
    return matches;
  }
  return manifest.albums.slice(0, 2);
};

export const buildGalleryResponse = (manifest: SiteManifest): GalleryResponse => {
  const stats = buildStats(manifest);
  const filters = buildFilters(manifest);
  const featuredPhotos = resolveFeaturedPhotos(manifest);
  const spotlightAlbums = resolveSpotlightAlbums(manifest);

  return {
    manifest,
    stats,
    filters,
    featuredPhotos,
    spotlightAlbums
  };
};

export const buildAdminDashboard = (manifest: SiteManifest): AdminDashboard => {
  const stats = buildStats(manifest);
  const photos = collectPhotos(manifest);
  const stories = manifest.albums.flatMap((album) => album.stories ?? []);

  const recentUploads = photos
    .slice()
    .sort((a, b) => {
      const dateA = a.capturedAt ? new Date(a.capturedAt).getTime() : 0;
      const dateB = b.capturedAt ? new Date(b.capturedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 6);

  const highlightedAlbums = resolveSpotlightAlbums(manifest).map((album) => ({
    slug: album.slug,
    name: album.name,
    cover: album.cover,
    stats: {
      totalPhotos: album.photos.length,
      totalFavorites: album.photos.filter((photo) => photo.hero || (photo.rating ?? 0) >= 4).length,
      totalLocations: uniqueSorted(album.photos.map((photo) => photo.location)).length,
      totalTags: Array.from(new Set(album.photos.flatMap((photo) => photo.tags ?? []))).length
    }
  }));

  return {
    stats: {
      ...stats,
      totalStories: stories.length
    },
    recentUploads,
    highlightedAlbums
  };
};
