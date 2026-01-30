const { dbAll, dbGet } = require('../config/database');

const isSafeTableName = (name) => /^[A-Za-z0-9_]+$/.test(name);

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

const getDataTable = async (req, res, next) => {
  try {
    const tableName = req.params.name;

    if (!tableName || !isSafeTableName(tableName)) {
      return res.status(400).json({
        error: 'Nom de table invalide',
        message: 'Le nom de table fourni est invalide',
      });
    }

    const table = await dbGet(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name = ?",
      [tableName],
    );

    if (!table) {
      return res.status(404).json({
        error: 'Table non trouvée',
        message: 'Cette table n\'existe pas',
      });
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
