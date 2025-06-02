// db/notification.ts

import { getDb } from '@/lib/db';
import { Notification } from '@/models/Notification';

export async function createNotification(notification: Notification): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO notifications (
      title, content, isGroup, groupKey, actions, iconId, postTime
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      notification.title,
      notification.content ?? null,
      notification.isGroup ?? 0,
      notification.groupKey ?? null,
      notification.actions ?? null,
      notification.iconId,
      notification.postTime,
    ]
  );
}

export async function getNotifications(): Promise<Notification[]> {
  const db = await getDb();
  return await db.select<Notification[]>(`SELECT * FROM notifications ORDER BY postTime DESC`);
}

export async function getNotificationById(id: number): Promise<Notification | null> {
  const db = await getDb();
  const result = await db.select<Notification[]>(`SELECT * FROM notifications WHERE id = ?`, [id]);
  return result[0] ?? null;
}

export async function updateNotification(id: number, updates: Partial<Notification>): Promise<void> {
  const db = await getDb();

  const keys = Object.keys(updates);
  if (keys.length === 0) return;

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  await db.execute(`UPDATE notifications SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteNotification(id: number): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM notifications WHERE id = ?`, [id]);
}

export async function clearNotifications(): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM notifications`);
}