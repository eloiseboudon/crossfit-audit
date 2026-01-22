const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class MarketBenchmark {
  static async findAll() {
    const sql = `
      SELECT * FROM market_benchmarks
      ORDER BY category, name
    `;
    return await dbAll(sql);
  }

  static async findById(id) {
    const sql = `SELECT * FROM market_benchmarks WHERE id = ?`;
    return await dbGet(sql, [id]);
  }

  static async findByCode(code) {
    const sql = `SELECT * FROM market_benchmarks WHERE benchmark_code = ?`;
    return await dbGet(sql, [code]);
  }

  static async create(data) {
    const { benchmark_code, name, value, unit, description, category } = data;
    const id = uuidv4();
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO market_benchmarks (
        id, benchmark_code, name, value, unit, description, category, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await dbRun(sql, [
      id,
      benchmark_code,
      name,
      value,
      unit,
      description,
      category,
      now
    ]);

    return await this.findById(id);
  }

  static async update(id, updates) {
    const allowedFields = ['name', 'value', 'unit', 'description', 'category'];
    const entries = Object.entries(updates).filter(([key, value]) => {
      return allowedFields.includes(key) && value !== undefined;
    });

    if (entries.length === 0) {
      return await this.findById(id);
    }

    const now = new Date().toISOString();
    const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);

    const sql = `UPDATE market_benchmarks SET ${setClause}, updated_at = ? WHERE id = ?`;

    await dbRun(sql, [...values, now, id]);
    return await this.findById(id);
  }
}

module.exports = MarketBenchmark;
