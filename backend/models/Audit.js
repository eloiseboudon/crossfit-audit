const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { AUDIT_STATUS, CURRENCY } = require('../constants');

/**
 * Modèle d'accès aux audits.
 * Gère la création, la lecture et la mise à jour des audits.
 */
class Audit {
  /**
   * Liste tous les audits, optionnellement filtrés par salle.
   *
   * @param {string | null} [gymId=null] - Identifiant de la salle.
   * @returns {Promise<object[]>} Liste des audits triés par date de création.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const audits = Audit.findAll('gym-123');
   */
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
    
    return dbAll(sql, params);
  }

  /**
   * Liste les audits accessibles par un utilisateur.
   *
   * @param {string} userId - Identifiant de l'utilisateur.
   * @param {string | null} [gymId=null] - Filtre optionnel sur une salle.
   * @returns {Promise<object[]>} Audits accessibles par l'utilisateur.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const audits = Audit.findAllForUser('user-123');
   */
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

    return dbAll(sql, params);
  }

  /**
   * Récupère un audit par son identifiant.
   *
   * @param {string} id - Identifiant de l'audit.
   * @returns {Promise<object | undefined>} Audit trouvé ou undefined.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const audit = Audit.findById('audit-123');
   */
  static async findById(id) {
    const sql = `
      SELECT a.*, g.name as gym_name
      FROM audits a
      LEFT JOIN gyms g ON a.gym_id = g.id
      WHERE a.id = ?
    `;
    return dbGet(sql, [id]);
  }

  /**
   * Crée un nouvel audit.
   *
   * @param {object} auditData - Données de l'audit.
   * @param {string} auditData.gym_id - Identifiant de la salle.
   * @param {string} [auditData.status=AUDIT_STATUS.DRAFT] - Statut de l'audit.
   * @param {string} [auditData.audit_date_start] - Date de début.
   * @param {string} [auditData.audit_date_end] - Date de fin.
   * @param {string} auditData.baseline_period - Période de référence.
   * @param {string} [auditData.currency=CURRENCY.EUR] - Devise.
   * @param {string} [auditData.notes] - Notes internes.
   * @returns {Promise<object>} Audit créé.
   * @throws {Error} Si l'insert échoue.
   *
   * @example
   * const audit = Audit.create({ gym_id: 'gym-123', baseline_period: '2024-Q1' });
   */
  static async create(auditData) {
    const {
      gym_id, status = AUDIT_STATUS.DRAFT, audit_date_start, audit_date_end,
      baseline_period, currency = CURRENCY.EUR, notes
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
    
    dbRun(sql, [
      id, gym_id, status, audit_date_start, audit_date_end,
      baseline_period, currency, notes, now, now
    ]);
    
    return await this.findById(id);
  }

  /**
   * Met à jour un audit.
   *
   * @param {string} id - Identifiant de l'audit.
   * @param {object} auditData - Données à mettre à jour.
   * @returns {Promise<object>} Audit mis à jour.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * const audit = Audit.update('audit-123', { status: 'in_progress' });
   */
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
    
    dbRun(sql, [
      status, audit_date_start, audit_date_end, baseline_period,
      currency, notes, completion_percentage, now, id
    ]);
    
    return await this.findById(id);
  }

  /**
   * Supprime un audit.
   *
   * @param {string} id - Identifiant de l'audit.
   * @returns {Promise<boolean>} True si la suppression est effectuée.
   * @throws {Error} Si la suppression échoue.
   *
   * @example
   * Audit.delete('audit-123');
   */
  static async delete(id) {
    const sql = `DELETE FROM audits WHERE id = ?`;
    dbRun(sql, [id]);
    return true;
  }

  /**
   * Récupère un audit complet avec réponses, KPIs, scores et recommandations.
   *
   * @param {string} id - Identifiant de l'audit.
   * @returns {Promise<object | null>} Audit complet ou null si inexistant.
   * @throws {Error} Si une requête SQL échoue.
   *
   * @example
   * const audit = Audit.getComplete('audit-123');
   */
  static async getComplete(id) {
    const audit = await this.findById(id);
    if (!audit) return null;

    // Récupérer toutes les réponses
    const answersSql = `SELECT * FROM answers WHERE audit_id = ? ORDER BY block_code, question_code`;
    const answers = dbAll(answersSql, [id]);

    // Récupérer tous les KPIs
    const kpisSql = `SELECT * FROM kpis WHERE audit_id = ? ORDER BY kpi_code`;
    const kpis = dbAll(kpisSql, [id]);

    // Récupérer tous les scores
    const scoresSql = `SELECT * FROM scores WHERE audit_id = ? ORDER BY pillar_code`;
    const scores = dbAll(scoresSql, [id]);

    // Récupérer toutes les recommandations
    const recsSql = `SELECT * FROM recommendations WHERE audit_id = ? ORDER BY priority, expected_impact_eur DESC`;
    const recommendations = dbAll(recsSql, [id]);

    return {
      ...audit,
      answers,
      kpis,
      scores,
      recommendations
    };
  }

  /**
   * Calcule et met à jour le pourcentage de complétion d'un audit.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @returns {Promise<number>} Pourcentage de complétion calculé.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * const completion = Audit.updateCompletionPercentage('audit-123');
   */
  static async updateCompletionPercentage(auditId) {
    // Compter le nombre total de questions attendues (à adapter selon ta logique)
    const totalQuestions = 250;
    
    // Compter les réponses données
    const sql = `SELECT COUNT(*) as count FROM answers WHERE audit_id = ? AND value IS NOT NULL AND value != ''`;
    const result = dbGet(sql, [auditId]);
    
    const completion = (result.count / totalQuestions) * 100;
    
    await this.update(auditId, { completion_percentage: Math.round(completion) });
    
    return completion;
  }
}

module.exports = Audit;
