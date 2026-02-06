const { dbAll, dbGet, dbRun, dbTransaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Modèle d'accès aux réponses d'audit.
 * Gère la lecture, la création et la mise à jour des réponses.
 */
class Answer {
  /**
   * Récupère toutes les réponses d'un audit.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @returns {object[]} Liste des réponses ordonnées par bloc et question.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const answers = Answer.findByAuditId('audit-123');
   */
  static async findByAuditId(auditId) {
    const sql = `
      SELECT * FROM answers 
      WHERE audit_id = ? 
      ORDER BY block_code, question_code
    `;
    return dbAll(sql, [auditId]);
  }

  /**
   * Récupère les réponses d'un audit pour un bloc donné.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @param {string} blockCode - Code du bloc de questions.
   * @returns {object[]} Liste des réponses pour le bloc.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const blockAnswers = Answer.findByAuditAndBlock('audit-123', 'financials');
   */
  static async findByAuditAndBlock(auditId, blockCode) {
    const sql = `
      SELECT * FROM answers 
      WHERE audit_id = ? AND block_code = ?
      ORDER BY question_code
    `;
    return dbAll(sql, [auditId, blockCode]);
  }

  /**
   * Récupère une réponse unique pour une question donnée.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @param {string} blockCode - Code du bloc.
   * @param {string} questionCode - Code de la question.
   * @returns {object | null} Réponse si trouvée, sinon null.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const answer = Answer.findOne('audit-123', 'financials', 'q1');
   */
  static async findOne(auditId, blockCode, questionCode) {
    const sql = `
      SELECT * FROM answers 
      WHERE audit_id = ? AND block_code = ? AND question_code = ?
    `;
    return dbGet(sql, [auditId, blockCode, questionCode]);
  }

  /**
   * Crée ou met à jour une réponse.
   *
   * @param {object} answerData - Données de réponse.
   * @param {string} answerData.audit_id - Identifiant de l'audit.
   * @param {string} answerData.block_code - Code du bloc.
   * @param {string} answerData.question_code - Code de la question.
   * @param {string | number | null} answerData.value - Valeur de la réponse.
   * @returns {object | null} La réponse sauvegardée.
   * @throws {Error} Si l'insert échoue.
   *
   * @example
   * const saved = Answer.upsert({
   *   audit_id: 'audit-123',
   *   block_code: 'financials',
   *   question_code: 'q1',
   *   value: 42
   * });
   */
  static upsertSync(answerData) {
    const { audit_id, block_code, question_code, value } = answerData;
    
    const now = new Date().toISOString();
    const id = uuidv4();
    const sql = `
      INSERT INTO answers (id, audit_id, block_code, question_code, value, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(audit_id, block_code, question_code)
      DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `;
    dbRun(sql, [id, audit_id, block_code, question_code, value, now, now]);
    const selectSql = `
      SELECT * FROM answers 
      WHERE audit_id = ? AND block_code = ? AND question_code = ?
    `;
    return dbGet(selectSql, [audit_id, block_code, question_code]);
  }

  static async upsert(answerData) {
    return this.upsertSync(answerData);
  }

  /**
   * Met à jour ou insère un lot de réponses.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @param {object[]} answersArray - Tableau de réponses (block_code, question_code, value).
   * @returns {object[]} Réponses sauvegardées.
   * @throws {Error} Si une des opérations échoue.
   *
   * @example
   * const saved = Answer.bulkUpsert('audit-123', [
   *   { block_code: 'financials', question_code: 'q1', value: 10 }
   * ]);
   */
  static async bulkUpsert(auditId, answersArray) {
    return dbTransaction(() => {
      const results = [];
      for (const answer of answersArray) {
        const result = this.upsertSync({
          audit_id: auditId,
          ...answer
        });
        results.push(result);
      }
      return results;
    });
  }

  /**
   * Supprime une réponse pour une question donnée.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @param {string} blockCode - Code du bloc.
   * @param {string} questionCode - Code de la question.
   * @returns {boolean} True si la suppression est effectuée.
   * @throws {Error} Si la suppression échoue.
   *
   * @example
   * Answer.delete('audit-123', 'financials', 'q1');
   */
  static async delete(auditId, blockCode, questionCode) {
    const sql = `
      DELETE FROM answers 
      WHERE audit_id = ? AND block_code = ? AND question_code = ?
    `;
    dbRun(sql, [auditId, blockCode, questionCode]);
    return true;
  }

  /**
   * Supprime toutes les réponses d'un audit.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @returns {boolean} True si la suppression est effectuée.
   * @throws {Error} Si la suppression échoue.
   *
   * @example
   * Answer.deleteByAudit('audit-123');
   */
  static async deleteByAudit(auditId) {
    const sql = `DELETE FROM answers WHERE audit_id = ?`;
    dbRun(sql, [auditId]);
    return true;
  }
}

module.exports = Answer;
