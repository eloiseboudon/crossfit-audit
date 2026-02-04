const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const resolveDbPath = () => {
  if (!process.env.DB_PATH) {
    return path.join(__dirname, '..', 'database', 'crossfit_audit.db');
  }

  return path.isAbsolute(process.env.DB_PATH)
    ? process.env.DB_PATH
    : path.join(__dirname, '..', process.env.DB_PATH);
};

const dbPath = resolveDbPath();

// Créer le dossier database s'il n'existe pas
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connexion à la base de données
let db;
try {
  db = new Database(dbPath);
  logger.info('✅ Connecté à la base de données SQLite');

  db.pragma('foreign_keys = ON');
  logger.info('✅ Foreign keys activées');
} catch (err) {
  logger.error('❌ Erreur de connexion à la base de données:', err.message);
  process.exit(1);
}

const normalizeParams = (params) => {
  if (params === undefined || params === null) {
    return [];
  }

  return Array.isArray(params) ? params : [params];
};

// Wrapper pour promisifier les requêtes
const dbAll = (sql, params = []) => {
  try {
    const rows = db.prepare(sql).all(...normalizeParams(params));
    return Promise.resolve(rows);
  } catch (err) {
    return Promise.reject(err);
  }
};

const dbGet = (sql, params = []) => {
  try {
    const row = db.prepare(sql).get(...normalizeParams(params));
    return Promise.resolve(row ?? null);
  } catch (err) {
    return Promise.reject(err);
  }
};

const dbRun = (sql, params = []) => {
  try {
    const info = db.prepare(sql).run(...normalizeParams(params));
    return Promise.resolve({ id: info.lastInsertRowid, changes: info.changes });
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = {
  db,
  dbAll,
  dbGet,
  dbRun
};
