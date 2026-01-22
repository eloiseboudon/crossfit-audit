const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ============================================
// KPI Model
// ============================================
class KPI {
  static async findByAuditId(auditId) {
    const sql = `SELECT * FROM kpis WHERE audit_id = ? ORDER BY kpi_code`;
    return await dbAll(sql, [auditId]);
  }

  static async findOne(auditId, kpiCode) {
    const sql = `SELECT * FROM kpis WHERE audit_id = ? AND kpi_code = ?`;
    return await dbGet(sql, [auditId, kpiCode]);
  }

  static async upsert(kpiData) {
    const { audit_id, kpi_code, value, unit, inputs_snapshot } = kpiData;
    
    const existing = await this.findOne(audit_id, kpi_code);
    const now = new Date().toISOString();
    
    if (existing) {
      const sql = `
        UPDATE kpis 
        SET value = ?, unit = ?, computed_at = ?, inputs_snapshot = ?
        WHERE audit_id = ? AND kpi_code = ?
      `;
      await dbRun(sql, [value, unit, now, inputs_snapshot, audit_id, kpi_code]);
    } else {
      const id = uuidv4();
      const sql = `
        INSERT INTO kpis (id, audit_id, kpi_code, value, unit, computed_at, inputs_snapshot)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await dbRun(sql, [id, audit_id, kpi_code, value, unit, now, inputs_snapshot]);
    }
    
    return await this.findOne(audit_id, kpi_code);
  }

  static async bulkUpsert(auditId, kpisArray) {
    const results = [];
    for (const kpi of kpisArray) {
      const result = await this.upsert({
        audit_id: auditId,
        ...kpi
      });
      results.push(result);
    }
    return results;
  }

  static async deleteByAudit(auditId) {
    const sql = `DELETE FROM kpis WHERE audit_id = ?`;
    await dbRun(sql, [auditId]);
    return true;
  }
}

// ============================================
// Score Model
// ============================================
class Score {
  static async findByAuditId(auditId) {
    const sql = `SELECT * FROM scores WHERE audit_id = ? ORDER BY pillar_code`;
    return await dbAll(sql, [auditId]);
  }

  static async findOne(auditId, pillarCode) {
    const sql = `SELECT * FROM scores WHERE audit_id = ? AND pillar_code = ?`;
    return await dbGet(sql, [auditId, pillarCode]);
  }

  static async upsert(scoreData) {
    const { audit_id, pillar_code, pillar_name, score, weight, details } = scoreData;
    
    const existing = await this.findOne(audit_id, pillar_code);
    const now = new Date().toISOString();
    
    if (existing) {
      const sql = `
        UPDATE scores 
        SET pillar_name = ?, score = ?, weight = ?, computed_at = ?, details = ?
        WHERE audit_id = ? AND pillar_code = ?
      `;
      await dbRun(sql, [pillar_name, score, weight, now, details, audit_id, pillar_code]);
    } else {
      const id = uuidv4();
      const sql = `
        INSERT INTO scores (id, audit_id, pillar_code, pillar_name, score, weight, computed_at, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await dbRun(sql, [id, audit_id, pillar_code, pillar_name, score, weight, now, details]);
    }
    
    return await this.findOne(audit_id, pillar_code);
  }

  static async bulkUpsert(auditId, scoresArray) {
    const results = [];
    for (const score of scoresArray) {
      const result = await this.upsert({
        audit_id: auditId,
        ...score
      });
      results.push(result);
    }
    return results;
  }

  static async deleteByAudit(auditId) {
    const sql = `DELETE FROM scores WHERE audit_id = ?`;
    await dbRun(sql, [auditId]);
    return true;
  }

  static async getGlobalScore(auditId) {
    const scores = await this.findByAuditId(auditId);
    if (scores.length === 0) return null;

    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);
    
    return {
      global_score: weightedSum / totalWeight,
      pillars: scores
    };
  }
}

// ============================================
// Recommendation Model
// ============================================
class Recommendation {
  static async findByAuditId(auditId) {
    const sql = `
      SELECT * FROM recommendations 
      WHERE audit_id = ? 
      ORDER BY 
        CASE priority 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        expected_impact_eur DESC
    `;
    return await dbAll(sql, [auditId]);
  }

  static async findById(id) {
    const sql = `SELECT * FROM recommendations WHERE id = ?`;
    return await dbGet(sql, [id]);
  }

  static async create(recData) {
    const {
      audit_id, rec_code, title, description, priority,
      expected_impact_eur, effort_level, confidence, category
    } = recData;
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const sql = `
      INSERT INTO recommendations (
        id, audit_id, rec_code, title, description, priority,
        expected_impact_eur, effort_level, confidence, category, computed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await dbRun(sql, [
      id, audit_id, rec_code, title, description, priority,
      expected_impact_eur, effort_level, confidence, category, now
    ]);
    
    return await this.findById(id);
  }

  static async bulkCreate(auditId, recsArray) {
    // Supprimer les anciennes recommandations
    await this.deleteByAudit(auditId);
    
    // Créer les nouvelles
    const results = [];
    for (const rec of recsArray) {
      const result = await this.create({
        audit_id: auditId,
        ...rec
      });
      results.push(result);
    }
    return results;
  }

  static async deleteByAudit(auditId) {
    const sql = `DELETE FROM recommendations WHERE audit_id = ?`;
    await dbRun(sql, [auditId]);
    return true;
  }

  static async delete(id) {
    const sql = `DELETE FROM recommendations WHERE id = ?`;
    await dbRun(sql, [id]);
    return true;
  }
}

module.exports = { KPI, Score, Recommendation };
