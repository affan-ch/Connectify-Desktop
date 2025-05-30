import { getDb } from '@/lib/db';
import { AppIcon } from '@/models/AppIcon';

export async function storeAppIcon(icon: AppIcon): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO app_icons (appName, packageName, packageVersion, appIconBase64) 
     VALUES (?, ?, ?, ?)`,
    [icon.appName, icon.packageName, icon.packageVersion, icon.appIconBase64]
  );
}

export async function getAppIcons(): Promise<AppIcon[]> {
  const db = await getDb();
  return await db.select<AppIcon[]>(`SELECT * FROM app_icons`);
}

export async function getAppIconById(id: number): Promise<AppIcon | null> {
  const db = await getDb();
  const result = await db.select<AppIcon[]>(`SELECT * FROM app_icons WHERE id = ?`, [id]);
  return result[0] || null;
}

export async function updateAppIcon(id: number, icon: Partial<AppIcon>): Promise<void> {
  const db = await getDb();
  const keys = Object.keys(icon);
  const values = Object.values(icon);
  if (keys.length === 0) return;

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  await db.execute(`UPDATE app_icons SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteAppIcon(id: number): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM app_icons WHERE id = ?`, [id]);
}
