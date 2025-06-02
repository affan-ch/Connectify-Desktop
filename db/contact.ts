// db/contact.ts

import { getDb } from '@/lib/db';
import { Contact } from '@/models/Contact';

export async function createContact(contact: Contact): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO contacts (
      firstName, lastName, phoneNumber, email, company, dob, address, notes, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      contact.firstName,
      contact.lastName ?? null,
      contact.phoneNumber,
      contact.email ?? null,
      contact.company ?? null,
      contact.dob ?? null,
      contact.address ?? null,
      contact.notes ?? null,
      contact.createdAt ?? Math.floor(Date.now() / 1000),
    ]
  );
}

export async function getContacts(): Promise<Contact[]> {
  const db = await getDb();
  return await db.select<Contact[]>(`SELECT * FROM contacts ORDER BY createdAt DESC`);
}

export async function getContactById(id: number): Promise<Contact | null> {
  const db = await getDb();
  const result = await db.select<Contact[]>(`SELECT * FROM contacts WHERE id = ?`, [id]);
  return result[0] ?? null;
}

export async function getContactByPhoneNumber(phoneNumber: string): Promise<Contact | null> {
  const db = await getDb();
  const result = await db.select<Contact[]>(
    `SELECT * FROM contacts WHERE phoneNumber = ? LIMIT 1`,
    [phoneNumber]
  );
  return result[0] ?? null;
}

export async function updateContact(id: number, updates: Partial<Contact>): Promise<void> {
  const db = await getDb();

  const keys = Object.keys(updates);
  if (keys.length === 0) return;

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  await db.execute(`UPDATE contacts SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteContact(id: number): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM contacts WHERE id = ?`, [id]);
}

export async function clearContacts(): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM contacts`);
}