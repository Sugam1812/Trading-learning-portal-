import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, '../../../../data');
mkdirSync(DB_DIR, { recursive: true });

const db = new Database(join(DB_DIR, 'trader.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY,
    username TEXT DEFAULT 'Trader',
    account_balance REAL DEFAULT 10000,
    starting_balance REAL DEFAULT 10000,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_active TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  INSERT OR IGNORE INTO profile (id) VALUES (1);

  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pair TEXT DEFAULT 'EUR/USD',
    direction TEXT NOT NULL,
    entry_price REAL NOT NULL,
    exit_price REAL,
    stop_loss REAL NOT NULL,
    take_profit REAL NOT NULL,
    lot_size REAL NOT NULL,
    risk_percent REAL NOT NULL,
    risk_amount REAL NOT NULL,
    pnl REAL,
    pips REAL,
    status TEXT DEFAULT 'open',
    session TEXT,
    strategy TEXT,
    notes TEXT,
    mistakes TEXT,
    opened_at TEXT DEFAULT (datetime('now')),
    closed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id INTEGER REFERENCES trades(id),
    date TEXT DEFAULT (date('now')),
    market_analysis TEXT,
    trade_plan TEXT,
    emotions_before TEXT,
    emotions_after TEXT,
    lessons_learned TEXT,
    ai_feedback TEXT,
    mood_rating INTEGER,
    confidence_rating INTEGER,
    discipline_rating INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id TEXT NOT NULL,
    quiz_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    passed INTEGER DEFAULT 0,
    answers TEXT,
    taken_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lesson_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    completed_at TEXT,
    UNIQUE(module_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    badge_id TEXT UNIQUE NOT NULL,
    earned_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS daily_routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT (date('now')),
    pre_market_done INTEGER DEFAULT 0,
    market_analysis TEXT,
    trade_plan TEXT,
    post_review_done INTEGER DEFAULT 0,
    post_review TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(date)
  );

  CREATE TABLE IF NOT EXISTS strategies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    entry_rules TEXT NOT NULL,
    exit_rules TEXT NOT NULL,
    backtest_results TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS api_cache (
    key TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS discipline_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT (date('now')),
    violation_type TEXT,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
