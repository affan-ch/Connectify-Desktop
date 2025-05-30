// db/contactPhoto.ts

import { getDb } from '@/lib/db';
import { ContactPhoto } from '@/models/ContactPhoto';

export async function createContactPhoto(photo: ContactPhoto): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO contact_photos (contactId, photoBase64)
     VALUES (?, ?)`,
    [photo.contactId, photo.photoBase64]
  );
}

export async function getContactPhotoByContactId(contactId: number): Promise<ContactPhoto | null> {
  const db = await getDb();
  const result = await db.select<ContactPhoto[]>(
    `SELECT * FROM contact_photos WHERE contactId = ?`,
    [contactId]
  );
  return result[0] ?? null;
}

export async function updateContactPhoto(contactId: number, photoBase64: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE contact_photos SET photoBase64 = ? WHERE contactId = ?`,
    [photoBase64, contactId]
  );
}

export async function deleteContactPhoto(contactId: number): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM contact_photos WHERE contactId = ?`, [contactId]);
}
