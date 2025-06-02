import { getDb } from '@/lib/db';
import { Message } from '@/models/Message';

export async function createMessage(message: Message): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO messages (
      phoneNumber, contactName, content, contentType, sender, status,
      isRead, simSlot, threadId, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      message.phoneNumber,
      message.contactName ?? "",
      message.content,
      message.contentType ?? 1,
      message.sender,
      message.status ?? 1,
      message.isRead ?? 1,
      message.simSlot ?? 1,
      message.threadId,
      message.timestamp ?? Math.floor(Date.now() / 1000),
    ]
  );
}

export async function getMessages(): Promise<Message[]> {
  const db = await getDb();
  return await db.select<Message[]>(`SELECT * FROM messages ORDER BY timestamp DESC`);
}

export async function getMessageById(id: number): Promise<Message | null> {
  const db = await getDb();
  const result = await db.select<Message[]>(`SELECT * FROM messages WHERE id = ?`, [id]);
  return result[0] ?? null;
}

export async function getMessagesByThreadId(threadId: number): Promise<Message[]> {
  const db = await getDb();
  return await db.select<Message[]>(
    `SELECT * FROM messages WHERE threadId = ? ORDER BY timestamp DESC`,
    [threadId]
  );
}

export async function updateMessage(id: number, updates: Partial<Message>): Promise<void> {
  const db = await getDb();

  const keys = Object.keys(updates);
  if (keys.length === 0) return;

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  await db.execute(`UPDATE messages SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteMessage(id: number): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM messages WHERE id = ?`, [id]);
}

export async function clearMessages(): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM messages`);
}