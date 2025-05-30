import { getDb } from '@/lib/db';
import { GalleryThumbnail } from '@/models/GalleryThumbnail';

export async function createGalleryThumbnail(thumbnail: Omit<GalleryThumbnail, 'id'>): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO gallery_thumbnails (galleryId, thumbnailBase64) VALUES (?, ?)`,
    [thumbnail.galleryId, thumbnail.thumbnailBase64]
  );
}

export async function getGalleryThumbnailByGalleryId(galleryId: number): Promise<GalleryThumbnail | null> {
  const db = await getDb();
  const result = await db.select<GalleryThumbnail[]>(
    `SELECT * FROM gallery_thumbnails WHERE galleryId = ?`,
    [galleryId]
  );
  return result[0] ?? null;
}

export async function updateGalleryThumbnailByGalleryId(galleryId: number, thumbnailBase64: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE gallery_thumbnails SET thumbnailBase64 = ? WHERE galleryId = ?`,
    [thumbnailBase64, galleryId]
  );
}

export async function deleteGalleryThumbnailByGalleryId(galleryId: number): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM gallery_thumbnails WHERE galleryId = ?`, [galleryId]);
}
