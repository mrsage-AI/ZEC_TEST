import { createClient, type Client } from '@libsql/client';

let _db: Client | null = null;

function getDb(): Client {
  if (!_db) {
    // Use test DB for local development and preview deployments
    // Use prod DB only for production deployment
    const isProd = process.env.VERCEL_ENV === 'production';

    _db = createClient({
      url: isProd
        ? process.env.TURSO_DATABASE_URL!
        : (process.env.TURSO_DATABASE_URL_TEST || process.env.TURSO_DATABASE_URL)!,
      authToken: isProd
        ? process.env.TURSO_AUTH_TOKEN!
        : (process.env.TURSO_AUTH_TOKEN_TEST || process.env.TURSO_AUTH_TOKEN)!,
    });
  }
  return _db;
}

export interface ZcashStats {
  timestamp: number;
  total_supply: number;
  shielded_supply: number;
  shielded_ratio: number;
  difficulty: number;
  block_height: number;
  zec_dominance: number;
}

export async function initDatabase() {
  const db = getDb();

  // Create table if doesn't exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS zcash_stats (
      timestamp INTEGER PRIMARY KEY,
      total_supply REAL NOT NULL,
      shielded_supply REAL NOT NULL,
      shielded_ratio REAL NOT NULL,
      difficulty REAL,
      block_height INTEGER,
      zec_dominance REAL
    )
  `);

  // Migration: Add new columns if they don't exist (for existing production tables)
  try {
    await db.execute(`ALTER TABLE zcash_stats ADD COLUMN difficulty REAL`);
  } catch (e: any) {
    // Column already exists, ignore error
    if (!e.message?.includes('duplicate column name')) {
      throw e;
    }
  }

  try {
    await db.execute(`ALTER TABLE zcash_stats ADD COLUMN block_height INTEGER`);
  } catch (e: any) {
    // Column already exists, ignore error
    if (!e.message?.includes('duplicate column name')) {
      throw e;
    }
  }

  try {
    await db.execute(`ALTER TABLE zcash_stats ADD COLUMN zec_dominance REAL`);
  } catch (e: any) {
    // Column already exists, ignore error
    if (!e.message?.includes('duplicate column name')) {
      throw e;
    }
  }
}

export async function saveStats(stats: Omit<ZcashStats, 'timestamp'>) {
  const db = getDb();
  const timestamp = Math.floor(Date.now() / 1000);

  await db.execute({
    sql: `INSERT INTO zcash_stats (timestamp, total_supply, shielded_supply, shielded_ratio, difficulty, block_height, zec_dominance)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [timestamp, stats.total_supply, stats.shielded_supply, stats.shielded_ratio, stats.difficulty, stats.block_height, stats.zec_dominance],
  });

  return timestamp;
}

export async function getLatestStats(): Promise<ZcashStats | null> {
  const db = getDb();
  const result = await db.execute(`
    SELECT * FROM zcash_stats
    ORDER BY timestamp DESC
    LIMIT 1
  `);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    timestamp: row.timestamp as number,
    total_supply: row.total_supply as number,
    shielded_supply: row.shielded_supply as number,
    shielded_ratio: row.shielded_ratio as number,
    difficulty: (row.difficulty as number | null) ?? 0,
    block_height: (row.block_height as number | null) ?? 0,
    zec_dominance: (row.zec_dominance as number | null) ?? 0,
  };
}

export async function getStats24hAgo(): Promise<ZcashStats | null> {
  const db = getDb();
  const timestamp24hAgo = Math.floor(Date.now() / 1000) - (24 * 60 * 60);

  const result = await db.execute({
    sql: `SELECT * FROM zcash_stats
          WHERE timestamp <= ?
          ORDER BY timestamp DESC
          LIMIT 1`,
    args: [timestamp24hAgo],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    timestamp: row.timestamp as number,
    total_supply: row.total_supply as number,
    shielded_supply: row.shielded_supply as number,
    shielded_ratio: row.shielded_ratio as number,
    difficulty: (row.difficulty as number | null) ?? 0,
    block_height: (row.block_height as number | null) ?? 0,
    zec_dominance: (row.zec_dominance as number | null) ?? 0,
  };
}
