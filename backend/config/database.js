/**
 * @module config/database
 * @description Configuration et utilitaires d'accès à la base de données SQLite.
 * Fournit des wrappers synchrones autour de better-sqlite3 et gère la connexion.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

/**
 * Résout le chemin absolu vers le fichier de base de données SQLite.
 * Utilise la variable d'environnement DB_PATH si définie, sinon un chemin par défaut.
 *
 * @returns {string} Chemin absolu vers le fichier .db.
 */
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

/**
 * Normalise une valeur pour l'insertion SQL : convertit undefined en null.
 *
 * @param {*} value - Valeur à normaliser.
 * @returns {*} La valeur originale ou null si undefined.
 */
const normalizeValue = (value) => {
  if (value === undefined) {
    return null;
  }
  return value;
};

/**
 * Normalise un ensemble de paramètres SQL en tableau, en convertissant les undefined en null.
 *
 * @param {*} params - Paramètres bruts (tableau, scalaire, null ou undefined).
 * @returns {Array} Tableau de paramètres normalisés.
 */
const normalizeParams = (params) => {
  if (params === undefined || params === null) {
    return [];
  }

  if (Array.isArray(params)) {
    return params.map(normalizeValue);
  }

  return [normalizeValue(params)];
};

/**
 * Exécute une requête SELECT et retourne toutes les lignes.
 *
 * @param {string} sql - Requête SQL à exécuter.
 * @param {Array} [params=[]] - Paramètres liés à la requête.
 * @returns {object[]} Tableau de lignes résultantes.
 */
const dbAll = (sql, params = []) => {
  const rows = db.prepare(sql).all(...normalizeParams(params));
  return rows;
};

/**
 * Exécute une requête SELECT et retourne la première ligne ou null.
 *
 * @param {string} sql - Requête SQL à exécuter.
 * @param {Array} [params=[]] - Paramètres liés à la requête.
 * @returns {object|null} Première ligne trouvée ou null.
 */
const dbGet = (sql, params = []) => {
  const row = db.prepare(sql).get(...normalizeParams(params));
  return row ?? null;
};

/**
 * Exécute une requête INSERT, UPDATE ou DELETE.
 *
 * @param {string} sql - Requête SQL à exécuter.
 * @param {Array} [params=[]] - Paramètres liés à la requête.
 * @returns {{ id: number, changes: number }} Identifiant de la dernière ligne insérée et nombre de lignes modifiées.
 */
const dbRun = (sql, params = []) => {
  const info = db.prepare(sql).run(...normalizeParams(params));
  return { id: info.lastInsertRowid, changes: info.changes };
};

/**
 * Exécute une fonction dans une transaction SQLite.
 * En cas d'erreur, la transaction est automatiquement annulée.
 *
 * @param {Function} fn - Fonction à exécuter dans la transaction.
 * @returns {*} Résultat de la fonction.
 */
const dbTransaction = (fn) => {
  const transaction = db.transaction(fn);
  return transaction();
};

module.exports = {
  db,
  dbAll,
  dbGet,
  dbRun,
  dbTransaction
};
