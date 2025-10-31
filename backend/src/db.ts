import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { hashPassword } from './utils/auth';

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'gallery.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  location TEXT,
  camera TEXT,
  lens TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  taken_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_featured INTEGER NOT NULL DEFAULT 0,
  palette TEXT,
  aspect_ratio REAL,
  views INTEGER NOT NULL DEFAULT 0,
  ai_notes TEXT
);

CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  cover_photo_id INTEGER,
  hero_image_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS photo_collections (
  photo_id INTEGER NOT NULL,
  collection_id INTEGER NOT NULL,
  PRIMARY KEY (photo_id, collection_id),
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exhibitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  hero_image_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME ?? 'curator';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD ?? 'visionary123';

const existingAdmin = db
  .prepare('SELECT id FROM admins WHERE username = ?')
  .get(DEFAULT_ADMIN_USERNAME) as { id: number } | undefined;

if (!existingAdmin) {
  const passwordHash = hashPassword(DEFAULT_ADMIN_PASSWORD);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(DEFAULT_ADMIN_USERNAME, passwordHash);
  console.log(`✅ 默认管理员账号已创建: ${DEFAULT_ADMIN_USERNAME}`);
}

export default db;
