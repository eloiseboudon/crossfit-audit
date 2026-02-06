const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Modèle d'accès aux benchmarks de marché.
 */
class MarketBenchmark {
  /**
   * Liste tous les benchmarks.
   *
   * @returns {Promise<object[]>} Liste des benchmarks.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const benchmarks = MarketBenchmark.findAll();
   */
  static findAll() {
    const sql = `
      SELECT * FROM market_benchmarks
      ORDER BY category, name
    `;
    return dbAll(sql);
  }

  /**
   * Récupère un benchmark par identifiant.
   *
   * @param {string} id - Identifiant du benchmark.
   * @returns {Promise<object | undefined>} Benchmark trouvé ou undefined.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const benchmark = MarketBenchmark.findById('benchmark-123');
   */
  static findById(id) {
    const sql = `SELECT * FROM market_benchmarks WHERE id = ?`;
    return dbGet(sql, [id]);
  }

  /**
   * Récupère un benchmark par code.
   *
   * @param {string} code - Code de benchmark.
   * @returns {Promise<object | undefined>} Benchmark trouvé ou undefined.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const benchmark = MarketBenchmark.findByCode('CA_AVG');
   */
  static findByCode(code) {
    const sql = `SELECT * FROM market_benchmarks WHERE benchmark_code = ?`;
    return dbGet(sql, [code]);
  }

  /**
   * Crée un benchmark de marché.
   *
   * @param {object} data - Données du benchmark.
   * @param {string} data.benchmark_code - Code unique.
   * @param {string} data.name - Nom.
   * @param {number} data.value - Valeur.
   * @param {string} [data.unit] - Unité.
   * @param {string} [data.description] - Description.
   * @param {string} [data.category] - Catégorie.
   * @returns {Promise<object>} Benchmark créé.
   * @throws {Error} Si l'insert échoue.
   *
   * @example
   * const benchmark = MarketBenchmark.create({ benchmark_code: 'CA_AVG', name: 'CA moyen', value: 200 });
   */
  static create(data) {
    const { benchmark_code, name, value, unit, description, category } = data;
    const id = uuidv4();
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO market_benchmarks (
        id, benchmark_code, name, value, unit, description, category, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    dbRun(sql, [
      id,
      benchmark_code,
      name,
      value,
      unit,
      description,
      category,
      now
    ]);

    return this.findById(id);
  }

  /**
   * Met à jour un benchmark de marché.
   *
   * @param {string} id - Identifiant du benchmark.
   * @param {object} updates - Champs à mettre à jour.
   * @returns {Promise<object>} Benchmark mis à jour.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * const benchmark = MarketBenchmark.update('benchmark-123', { value: 180 });
   */
  static update(id, updates) {
    const allowedFields = ['name', 'value', 'unit', 'description', 'category'];
    const entries = Object.entries(updates).filter(([key, value]) => {
      return allowedFields.includes(key) && value !== undefined;
    });

    if (entries.length === 0) {
      return this.findById(id);
    }

    const now = new Date().toISOString();
    const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);

    const sql = `UPDATE market_benchmarks SET ${setClause}, updated_at = ? WHERE id = ?`;

    dbRun(sql, [...values, now, id]);
    return this.findById(id);
  }
}

module.exports = MarketBenchmark;
