const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connecté à la base de données SQLite');
    
    // Activer les clés étrangères
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        console.error('❌ Erreur activation foreign keys:', err.message);
      } else {
        console.log('✅ Foreign keys activées');
      }
    });
  }
});

// Wrapper pour promisifier les requêtes
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

module.exports = {
  db,
  dbAll,
  dbGet,
  dbRun
};
