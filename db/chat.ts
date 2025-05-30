// db/chat.ts

import { getDb } from '@/lib/db';
import { Chat } from '@/models/Chat';

export async function createChatEntry(chat: Chat): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO chat (content, sender, contentType, filePath, timestamp)
     VALUES (?, ?, ?, ?, ?)`,
    [
      chat.content,
      chat.sender,
      chat.contentType,
      chat.filePath ?? null,
      chat.timestamp ?? Math.floor(Date.now() / 1000),
    ]
  );
}

export async function getChatEntries(): Promise<Chat[]> {
  const db = await getDb();
  return await db.select<Chat[]>(`SELECT * FROM chat ORDER BY timestamp DESC`);
}

export async function getChatEntryById(id: number): Promise<Chat | null> {
  const db = await getDb();
  const result = await db.select<Chat[]>(`SELECT * FROM chat WHERE id = ?`, [id]);
  return result[0] ?? null;
}

export async function updateChatEntry(id: number, updates: Partial<Chat>): Promise<void> {
  const db = await getDb();

  const keys = Object.keys(updates);
  if (keys.length === 0) return;

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  await db.execute(`UPDATE chat SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteChatEntry(id: number): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM chat WHERE id = ?`, [id]);
}
