// db/callLog.ts

import { getDb } from "@/lib/db";
import { CallLog } from "@/models/CallLog";

export async function insertCallLogsBatch(logs: CallLog[]) {
  const db = await getDb();

  try {
    // Start transaction
    await db.execute("BEGIN TRANSACTION");

    for (const log of logs) {
      await db.execute(
        `INSERT INTO call_logs 
          (phoneNumber, contactName, callType, duration, simSlot, isRead, isNew, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          log.phoneNumber,
          log.contactName ?? null,
          log.callType,
          log.duration ?? null,
          log.simSlot ?? null,
          log.isRead ?? null,
          log.isNew ?? null,
          log.timestamp ?? Math.floor(Date.now() / 1000),
        ]
      );
    }

    // Commit transaction
    await db.execute("COMMIT");
    console.log("Inserted all logs in one transaction");
  } catch (error) {
    await db.execute("ROLLBACK");
    console.error("Failed to insert logs:", error);
  }
}

export async function createCallLog(log: CallLog): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO call_logs (phoneNumber, contactName, callType, duration, simSlot, isRead, isNew, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      log.phoneNumber,
      log.contactName,
      log.callType,
      log.duration ?? 0,
      log.simSlot ?? 0,
      log.isRead ?? 0,
      log.isNew ?? 0,
      log.timestamp ?? Math.floor(Date.now() / 1000),
    ]
  );
}

export async function getCallLogs(): Promise<CallLog[]> {
  const db = await getDb();
  return await db.select<CallLog[]>(
    `SELECT * FROM call_logs ORDER BY timestamp DESC`
  );
}

export async function getCallLogById(id: number): Promise<CallLog | null> {
  const db = await getDb();
  const result = await db.select<CallLog[]>(
    `SELECT * FROM call_logs WHERE id = ?`,
    [id]
  );
  return result[0] ?? null;
}

export async function updateCallLog(
  id: number,
  updates: Partial<CallLog>
): Promise<void> {
  const db = await getDb();

  const keys = Object.keys(updates);
  if (keys.length === 0) return;

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = Object.values(updates);

  await db.execute(`UPDATE call_logs SET ${setClause} WHERE id = ?`, [
    ...values,
    id,
  ]);
}

export async function deleteCallLog(id: number): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM call_logs WHERE id = ?`, [id]);
}

export async function clearCallLogs(): Promise<void> {
  const db = await getDb();
  await db.execute(`DELETE FROM call_logs`);
}