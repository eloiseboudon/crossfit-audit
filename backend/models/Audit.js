const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Audit {
  static async findAll(gymId = null) {
    let sql = `
      SELECT a.*, g.name as gym_name
      FROM audits a
      LEFT JOIN gyms g ON a.gym_id = g.id
      ORDER BY a.created_at DESC
    `;
    let params = [];
    
    if (gymId) {
      sql = `
        SELECT a.*, g.name as gym_name
        FROM audits a
        LEFT JOIN gyms g ON a.gym_id = g.id
        WHERE a.gym_id = ?
        ORDER BY a.created_at DESC
      `;
      params = [gymId];
    }
    
    return await dbAll(sql, params);
  }

  static async findAllForUser(userId, gymId = null) {
    let sql = `
      SELECT a.*, g.name as gym_name
      FROM audits a
      LEFT JOIN gyms g ON a.gym_id = g.id
      LEFT JOIN gym_user_access ga ON ga.gym_id = a.gym_id AND ga.user_id = ?
      WHERE g.user_id = ? OR ga.user_id = ?
      ORDER BY a.created_at DESC
    `;
    let params = [userId, userId, userId];

    if (gymId) {
      sql = `
        SELECT a.*, g.name as gym_name
        FROM audits a
        LEFT JOIN gyms g ON a.gym_id = g.id
        LEFT JOIN gym_user_access ga ON ga.gym_id = a.gym_id AND ga.user_id = ?
        WHERE a.gym_id = ? AND (g.user_id = ? OR ga.user_id = ?)
        ORDER BY a.created_at DESC
      `;
      params = [userId, gymId, userId, userId];
    }

    return await dbAll(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT a.*, g.name as gym_name
      FROM audits a
      LEFT JOIN gyms g ON a.gym_id = g.id
      WHERE a.id = ?
    `;
    return await dbGet(sql, [id]);
  }

  static async create(auditData) {
    const {
      gym_id, status = 'draft', audit_date_start, audit_date_end,
      baseline_period, currency = 'EUR', notes
    } = auditData;
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const sql = `
      INSERT INTO audits (
        id, gym_id, status, audit_date_start, audit_date_end,
        baseline_period, currency, notes, completion_percentage,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `;
    
    await dbRun(sql, [
      id, gym_id, status, audit_date_start, audit_date_end,
      baseline_period, currency, notes, now, now
    ]);
    
    return await this.findById(id);
  }

  static async update(id, auditData) {
    const {
      status, audit_date_start, audit_date_end, baseline_period,
      currency, notes, completion_percentage
    } = auditData;
    
    const now = new Date().toISOString();
    
    const sql = `
      UPDATE audits SET
        status = COALESCE(?, status),
        audit_date_start = COALESCE(?, audit_date_start),
        audit_date_end = COALESCE(?, audit_date_end),
        baseline_period = COALESCE(?, baseline_period),
        currency = COALESCE(?, currency),
        notes = COALESCE(?, notes),
        completion_percentage = COALESCE(?, completion_percentage),
        updated_at = ?
      WHERE id = ?
    `;
    
    await dbRun(sql, [
      status, audit_date_start, audit_date_end, baseline_period,
      currency, notes, completion_percentage, now, id
    ]);
    
    return await this.findById(id);
  }

  static async delete(id) {
    const sql = `DELETE FROM audits WHERE id = ?`;
    await dbRun(sql, [id]);
    return true;
  }

  static async getComplete(id) {
    const audit = await this.findById(id);
    if (!audit) return null;

    // Récupérer toutes les réponses
    const answersSql = `SELECT * FROM answers WHERE audit_id = ? ORDER BY block_code, question_code`;
    const answers = await dbAll(answersSql, [id]);

    // Récupérer tous les KPIs
    const kpisSql = `SELECT * FROM kpis WHERE audit_id = ? ORDER BY kpi_code`;
    const kpis = await dbAll(kpisSql, [id]);

    // Récupérer tous les scores
    const scoresSql = `SELECT * FROM scores WHERE audit_id = ? ORDER BY pillar_code`;
    const scores = await dbAll(scoresSql, [id]);

    // Récupérer toutes les recommandations
    const recsSql = `SELECT * FROM recommendations WHERE audit_id = ? ORDER BY priority, expected_impact_eur DESC`;
    const recommendations = await dbAll(recsSql, [id]);

    return {
      ...audit,
      answers,
      kpis,
      scores,
      recommendations
    };
  }

  static async updateCompletionPercentage(auditId) {
    // Compter le nombre total de questions attendues (à adapter selon ta logique)
    const totalQuestions = 250;
    
    // Compter les réponses données
    const sql = `SELECT COUNT(*) as count FROM answers WHERE audit_id = ? AND value IS NOT NULL AND value != ''`;
    const result = await dbGet(sql, [auditId]);
    
    const completion = (result.count / totalQuestions) * 100;
    
    await this.update(auditId, { completion_percentage: Math.round(completion) });
    
    return completion;
  }
}

module.exports = Audit;
