import type { PhotoItem } from '../types/gallery';

export const formatExif = (photo: PhotoItem) => {
  const items: string[] = [];
  if (photo.camera) items.push(photo.camera);
  if (photo.lens) items.push(photo.lens);
  if (photo.aperture) items.push(`ƒ/${photo.aperture}`);
  if (photo.shutter) items.push(photo.shutter);
  if (photo.iso) items.push(`ISO ${photo.iso}`);
  if (photo.focalLength) items.push(photo.focalLength);
  return items.join(' · ');
};
