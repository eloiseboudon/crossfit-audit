const { dbAll, dbGet, dbRun, dbTransaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ============================================
// KPI Model
// ============================================
/**
 * Modèle d'accès aux KPIs d'audit.
 */
class KPI {
  /**
   * Récupère les KPIs d'un audit.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @returns {object[]} Liste des KPIs.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const kpis = KPI.findByAuditId('audit-123');
   */
  static async findByAuditId(auditId) {
    const sql = `SELECT * FROM kpis WHERE audit_id = ? ORDER BY kpi_code`;
    return dbAll(sql, [auditId]);
  }

  /**
   * Récupère un KPI unique.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @param {string} kpiCode - Code du KPI.
   * @returns {object | null} KPI trouvé ou null.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const kpi = KPI.findOne('audit-123', 'revenue');
   */
  static async findOne(auditId, kpiCode) {
    const sql = `SELECT * FROM kpis WHERE audit_id = ? AND kpi_code = ?`;
    return dbGet(sql, [auditId, kpiCode]);
  }

  /**
   * Crée ou met à jour un KPI.
   *
   * @param {object} kpiData - Données du KPI.
   * @param {string} kpiData.audit_id - Identifiant de l'audit.
   * @param {string} kpiData.kpi_code - Code du KPI.
   * @param {number} kpiData.value - Valeur calculée.
   * @param {string} [kpiData.unit] - Unité.
   * @param {string} [kpiData.inputs_snapshot] - Snapshot des entrées.
   * @returns {object | null} KPI sauvegardé.
   * @throws {Error} Si l'upsert échoue.
   *
   * @example
   * const saved = KPI.upsert({ audit_id: 'audit-123', kpi_code: 'rev', value: 12 });
   */
  static async upsert(kpiData) {
    const { audit_id, kpi_code, value, unit, inputs_snapshot } = kpiData;
    
    const now = new Date().toISOString();
    const id = uuidv4();
    const sql = `
      INSERT INTO kpis (id, audit_id, kpi_code, value, unit, computed_at, inputs_snapshot)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(audit_id, kpi_code)
      DO UPDATE SET value = excluded.value,
        unit = excluded.unit,
        computed_at = excluded.computed_at,
        inputs_snapshot = excluded.inputs_snapshot
    `;
    dbRun(sql, [id, audit_id, kpi_code, value, unit, now, inputs_snapshot]);
    return this.findOne(audit_id, kpi_code);
  }

  /**
   * Met à jour ou insère un lot de KPIs.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @param {object[]} kpisArray - Tableau de KPIs.
   * @returns {object[]} KPIs sauvegardés.
   * @throws {Error} Si une opération échoue.
   *
   * @example
   * const saved = KPI.bulkUpsert('audit-123', [{ kpi_code: 'rev', value: 10 }]);
   */
  static async bulkUpsert(auditId, kpisArray) {
    return dbTransaction(() => {
      const results = [];
      for (const kpi of kpisArray) {
        const result = this.upsert({
          audit_id: auditId,
          ...kpi
        });
        results.push(result);
      }
      return results;
    });
  }

  /**
   * Supprime tous les KPIs d'un audit.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @returns {boolean} True si la suppression est effectuée.
   * @throws {Error} Si la suppression échoue.
   *
   * @example
   * KPI.deleteByAudit('audit-123');
   */
  static async deleteByAudit(auditId) {
    const sql = `DELETE FROM kpis WHERE audit_id = ?`;
    dbRun(sql, [auditId]);
    return true;
  }
}

// ============================================
// Score Model
// ============================================
/**
 * Modèle d'accès aux scores d'audit.
 */
class Score {
  /**
   * Récupère les scores d'un audit.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @returns {object[]} Liste des scores.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const scores = Score.findByAuditId('audit-123');
   */
  static async findByAuditId(auditId) {
    const sql = `SELECT * FROM scores WHERE audit_id = ? ORDER BY pillar_code`;
    return dbAll(sql, [auditId]);
  }

  /**
   * Récupère un score unique par pilier.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @param {string} pillarCode - Code du pilier.
   * @returns {object | null} Score trouvé ou null.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const score = Score.findOne('audit-123', 'growth');
   */
  static async findOne(auditId, pillarCode) {
    const sql = `SELECT * FROM scores WHERE audit_id = ? AND pillar_code = ?`;
    return dbGet(sql, [auditId, pillarCode]);
  }

  /**
   * Crée ou met à jour un score.
   *
   * @param {object} scoreData - Données du score.
   * @param {string} scoreData.audit_id - Identifiant de l'audit.
   * @param {string} scoreData.pillar_code - Code du pilier.
   * @param {string} scoreData.pillar_name - Nom du pilier.
   * @param {number} scoreData.score - Score calculé.
   * @param {number} scoreData.weight - Poids du pilier.
   * @param {string} [scoreData.details] - Détails de calcul.
   * @returns {object | null} Score sauvegardé.
   * @throws {Error} Si l'upsert échoue.
   *
   * @example
   * const saved = Score.upsert({ audit_id: 'audit-123', pillar_code: 'growth', score: 80, weight: 1 });
   */
  static async upsert(scoreData) {
    const { audit_id, pillar_code, pillar_name, score, weight, details } = scoreData;
    
    const now = new Date().toISOString();
    const id = uuidv4();
    const sql = `
      INSERT INTO scores (id, audit_id, pillar_code, pillar_name, score, weight, computed_at, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(audit_id, pillar_code)
      DO UPDATE SET pillar_name = excluded.pillar_name,
        score = excluded.score,
        weight = excluded.weight,
        computed_at = excluded.computed_at,
        details = excluded.details
    `;
    dbRun(sql, [id, audit_id, pillar_code, pillar_name, score, weight, now, details]);
    return this.findOne(audit_id, pillar_code);
  }

  /**
   * Met à jour ou insère un lot de scores.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @param {object[]} scoresArray - Tableau de scores.
   * @returns {object[]} Scores sauvegardés.
   * @throws {Error} Si une opération échoue.
   *
   * @example
   * const saved = Score.bulkUpsert('audit-123', [{ pillar_code: 'growth', score: 80, weight: 1 }]);
   */
  static async bulkUpsert(auditId, scoresArray) {
    return dbTransaction(() => {
      const results = [];
      for (const score of scoresArray) {
        const result = this.upsert({
          audit_id: auditId,
          ...score
        });
        results.push(result);
      }
      return results;
    });
  }

  /**
   * Supprime tous les scores d'un audit.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @returns {boolean} True si la suppression est effectuée.
   * @throws {Error} Si la suppression échoue.
   *
   * @example
   * Score.deleteByAudit('audit-123');
   */
  static async deleteByAudit(auditId) {
    const sql = `DELETE FROM scores WHERE audit_id = ?`;
    dbRun(sql, [auditId]);
    return true;
  }

  /**
   * Calcule le score global pondéré d'un audit.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @returns {{global_score: number, pillars: object[]} | null} Score global et détails des piliers.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const global = Score.getGlobalScore('audit-123');
   */
  static async getGlobalScore(auditId) {
    const scores = this.findByAuditId(auditId);
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
/**
 * Modèle d'accès aux recommandations d'audit.
 */
class Recommendation {
  /**
   * Récupère les recommandations d'un audit.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @returns {object[]} Liste des recommandations.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const recs = Recommendation.findByAuditId('audit-123');
   */
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
    return dbAll(sql, [auditId]);
  }

  /**
   * Récupère une recommandation par identifiant.
   *
   * @param {string} id - Identifiant de la recommandation.
   * @returns {object | null} Recommandation trouvée ou null.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const rec = Recommendation.findById('rec-123');
   */
  static async findById(id) {
    const sql = `SELECT * FROM recommendations WHERE id = ?`;
    return dbGet(sql, [id]);
  }

  /**
   * Crée une recommandation.
   *
   * @param {object} recData - Données de recommandation.
   * @param {string} recData.audit_id - Identifiant de l'audit.
   * @param {string} recData.rec_code - Code de recommandation.
   * @param {string} recData.title - Titre.
   * @param {string} [recData.description] - Description.
   * @param {string} recData.priority - Priorité.
   * @param {number} [recData.expected_impact_eur] - Impact estimé.
   * @param {string} [recData.effort_level] - Niveau d'effort.
   * @param {string} [recData.confidence] - Confiance.
   * @param {string} [recData.category] - Catégorie.
   * @returns {object | null} Recommandation créée.
   * @throws {Error} Si l'insert échoue.
   *
   * @example
   * const rec = Recommendation.create({ audit_id: 'audit-123', rec_code: 'R1', title: 'Optimiser' });
   */
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
    
    dbRun(sql, [
      id, audit_id, rec_code, title, description, priority,
      expected_impact_eur, effort_level, confidence, category, now
    ]);
    
    return this.findById(id);
  }

  /**
   * Remplace toutes les recommandations d'un audit.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @param {object[]} recsArray - Tableau de recommandations.
   * @returns {object[]} Recommandations créées.
   * @throws {Error} Si la suppression ou la création échoue.
   *
   * @example
   * const recs = Recommendation.bulkCreate('audit-123', [{ rec_code: 'R1', title: 'Optimiser' }]);
   */
  static async bulkCreate(auditId, recsArray) {
    return dbTransaction(() => {
      // Supprimer les anciennes recommandations
      this.deleteByAudit(auditId);
      
      // Créer les nouvelles
      const results = [];
      for (const rec of recsArray) {
        const result = this.create({
          audit_id: auditId,
          ...rec
        });
        results.push(result);
      }
      return results;
    });
  }

  /**
   * Supprime toutes les recommandations d'un audit.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @returns {boolean} True si la suppression est effectuée.
   * @throws {Error} Si la suppression échoue.
   *
   * @example
   * Recommendation.deleteByAudit('audit-123');
   */
  static async deleteByAudit(auditId) {
    const sql = `DELETE FROM recommendations WHERE audit_id = ?`;
    dbRun(sql, [auditId]);
    return true;
  }

  /**
   * Supprime une recommandation spécifique.
   *
   * @param {string} id - Identifiant de la recommandation.
   * @returns {boolean} True si la suppression est effectuée.
   * @throws {Error} Si la suppression échoue.
   *
   * @example
   * Recommendation.delete('rec-123');
   */
  static async delete(id) {
    const sql = `DELETE FROM recommendations WHERE id = ?`;
    dbRun(sql, [id]);
    return true;
  }
}

module.exports = { KPI, Score, Recommendation };
