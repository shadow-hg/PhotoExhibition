import { useMemo, useState } from 'react';
import { GalleryHero } from './components/GalleryHero';
import { FeaturedPhotos } from './components/FeaturedPhotos';
import { SpotlightAlbums } from './components/SpotlightAlbums';
import { AlbumExplorer } from './components/AlbumExplorer';
import { TimelineSection } from './components/TimelineSection';
import { DownloadDialog } from './components/DownloadDialog';
import { PhotoDetailDialog } from './components/PhotoDetailDialog';
import { AlbumDetailDialog } from './components/AlbumDetailDialog';
import { useSiteConfig } from './hooks/useSiteConfig';
import { useTrackView } from './hooks/useTrackView';
import type { Album, PhotoAsset } from './types/gallery';

function App() {
  const { manifest, stats, filters, featuredPhotos, spotlightAlbums, loading, error } = useSiteConfig();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoAsset | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);

  useTrackView({
    page: 'gallery',
    metadata: manifest
      ? {
          albums: manifest.albums.length,
          updatedAt: manifest.updatedAt
        }
      : undefined
  });

  const timeline = manifest?.timeline ?? [];

  const spotlightBySlug = useMemo(() => {
    if (!manifest) return new Map<string, Album>();
    const map = new Map<string, Album>();
    for (const album of manifest.albums) {
      map.set(album.slug, album);
    }
    return map;
  }, [manifest]);

  const handleOpenAlbum = (album: Album | string) => {
    if (!manifest) return;
    if (typeof album === 'string') {
      const found = spotlightBySlug.get(album);
      if (found) {
        setSelectedAlbum(found);
      }
      return;
    }
    setSelectedAlbum(album);
  };

  const resolvePhotoById = (id: string) => {
    if (!manifest) return null;
    for (const album of manifest.albums) {
      const found = album.photos.find((photo) => photo.id === id);
      if (found) return found;
    }
    return null;
  };

  const handleSelectPhoto = (photo: PhotoAsset) => {
    setSelectedPhoto(photo);
  };

  const handleSelectPhotoFromAlbum = (photoId: string) => {
    const found = resolvePhotoById(photoId);
    if (found) {
      setSelectedPhoto(found);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-slate-50">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pt-12">
        {loading && (
          <div className="space-y-6">
            <div className="h-64 animate-pulse rounded-3xl bg-slate-900/60" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-40 animate-pulse rounded-3xl bg-slate-900/60" />
              <div className="h-40 animate-pulse rounded-3xl bg-slate-900/60" />
              <div className="h-40 animate-pulse rounded-3xl bg-slate-900/60" />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">
            配置加载失败：{error}
          </div>
        )}

        {manifest && (
          <>
            <GalleryHero
              manifest={manifest}
              stats={stats}
              onDownloadClick={() => setDownloadOpen(true)}
            />
            <FeaturedPhotos photos={featuredPhotos} onSelect={handleSelectPhoto} />
            <SpotlightAlbums albums={spotlightAlbums} onOpen={handleOpenAlbum} />
            <AlbumExplorer
              albums={manifest.albums}
              filters={filters}
              onOpenAlbum={handleOpenAlbum}
              onSelectPhoto={handleSelectPhoto}
            />
            {timeline.length > 0 && <TimelineSection timeline={timeline} onOpenAlbum={handleOpenAlbum} />}
          </>
        )}
      </main>

      <DownloadDialog
        action={manifest?.actions?.download}
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
      />

      <PhotoDetailDialog photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />

      <AlbumDetailDialog album={selectedAlbum} onClose={() => setSelectedAlbum(null)} onSelectPhoto={handleSelectPhotoFromAlbum} />
    </div>
  );
}

export default App;
