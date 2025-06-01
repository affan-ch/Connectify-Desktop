// db/setting.ts

import { getDb } from '@/lib/db';
import { Setting } from '@/models/Setting';

export async function upsertSetting(setting: Setting): Promise<void> {
  const db = await getDb();
  await db.execute(
    `
    INSERT INTO settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    [setting.key, setting.value]
  );
}

export async function getSettingByKey(key: string): Promise<Setting | null> {
  const db = await getDb();
  const result = await db.select<Setting[]>(`SELECT * FROM settings WHERE key = ?`, [key]);
  return result[0] ?? null;
}

export async function getAllSettings(): Promise<Setting[]> {
  const db = await getDb();
  return await db.select<Setting[]>(`SELECT * FROM settings`);
}

export async function deleteSetting(key: string): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM settings WHERE key = ?`, [key]);
}
