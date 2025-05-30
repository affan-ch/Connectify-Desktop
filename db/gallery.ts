// db/gallery.ts

import { getDb } from '@/lib/db';
import { Gallery } from '@/models/Gallery';

export async function createGalleryEntry(entry: Gallery): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO gallery (
      mediaId, fileName, filePath, mediaType, mimeType, size, width, height,
      duration, dateTaken, dateModified, isFavorite, synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.mediaId,
      entry.fileName,
      entry.filePath,
      entry.mediaType ?? 'image',
      entry.mimeType,
      entry.size,
      entry.width ?? null,
      entry.height ?? null,
      entry.duration ?? 0,
      entry.dateTaken,
      entry.dateModified ?? null,
      entry.isFavorite ?? 0,
      entry.synced ?? 0,
    ]
  );
}

export async function getGalleryEntries(): Promise<Gallery[]> {
  const db = await getDb();
  return await db.select<Gallery[]>(`SELECT * FROM gallery ORDER BY dateTaken DESC`);
}

export async function getGalleryEntryById(id: number): Promise<Gallery | null> {
  const db = await getDb();
  const result = await db.select<Gallery[]>(`SELECT * FROM gallery WHERE id = ?`, [id]);
  return result[0] ?? null;
}

export async function updateGalleryEntry(id: number, updates: Partial<Gallery>): Promise<void> {
  const db = await getDb();
  const keys = Object.keys(updates);
  if (keys.length === 0) return;

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  await db.execute(`UPDATE gallery SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteGalleryEntry(id: number): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM gallery WHERE id = ?`, [id]);
}
