const { dbAll, dbGet } = require('../config/database');
const ApiError = require('../utils/ApiError');

/**
 * Vérifie si un nom de table est sûr (caractères alphanumériques/underscore).
 *
 * @param {string} name - Nom de table.
 * @returns {boolean} True si le nom est sûr.
 */
const isSafeTableName = (name) => /^[A-Za-z0-9_]+$/.test(name);

/**
 * @desc Liste les tables de données disponibles.
 * @route GET /api/data-tables
 * @access Public
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const listDataTables = async (req, res, next) => {
  try {
    const tables = await dbAll(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );

    const summaries = await Promise.all(
      tables.map(async ({ name }) => {
        const row = await dbGet(`SELECT COUNT(*) AS count FROM "${name}"`);
        return {
          name,
          rowCount: row?.count ?? 0,
        };
      }),
    );

    res.json({
      success: true,
      count: summaries.length,
      data: summaries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Récupère le contenu d'une table spécifique.
 * @route GET /api/data-tables/:name
 * @access Public
 * @param {Request} req - Requête Express.
 * @param {Response} res - Réponse Express.
 * @param {NextFunction} next - Middleware d'erreurs.
 */
const getDataTable = async (req, res, next) => {
  try {
    const tableName = req.params.name;

    if (!tableName || !isSafeTableName(tableName)) {
      throw ApiError.badRequest('Le nom de table fourni est invalide');
    }

    const table = await dbGet(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name = ?",
      [tableName],
    );

    if (!table) {
      throw ApiError.notFound('Cette table n\'existe pas');
    }

    const columnsInfo = await dbAll(`PRAGMA table_info("${tableName}")`);
    const columns = columnsInfo.map((column) => column.name);
    const rows = await dbAll(`SELECT * FROM "${tableName}"`);

    res.json({
      success: true,
      data: {
        name: tableName,
        columns,
        rows,
        rowCount: rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDataTables,
  getDataTable,
};
