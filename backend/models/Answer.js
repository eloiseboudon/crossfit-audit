const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Modèle d'accès aux réponses d'audit.
 * Gère la lecture, la création et la mise à jour des réponses.
 */
class Answer {
  /**
   * Récupère toutes les réponses d'un audit.
   *
   * @async
   * @param {string} auditId - Identifiant de l'audit.
   * @returns {Promise<object[]>} Liste des réponses ordonnées par bloc et question.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const answers = await Answer.findByAuditId('audit-123');
   */
  static async findByAuditId(auditId) {
    const sql = `
      SELECT * FROM answers 
      WHERE audit_id = ? 
      ORDER BY block_code, question_code
    `;
    return await dbAll(sql, [auditId]);
  }

  /**
   * Récupère les réponses d'un audit pour un bloc donné.
   *
   * @async
   * @param {string} auditId - Identifiant de l'audit.
   * @param {string} blockCode - Code du bloc de questions.
   * @returns {Promise<object[]>} Liste des réponses pour le bloc.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const blockAnswers = await Answer.findByAuditAndBlock('audit-123', 'financials');
   */
  static async findByAuditAndBlock(auditId, blockCode) {
    const sql = `
      SELECT * FROM answers 
      WHERE audit_id = ? AND block_code = ?
      ORDER BY question_code
    `;
    return await dbAll(sql, [auditId, blockCode]);
  }

  /**
   * Récupère une réponse unique pour une question donnée.
   *
   * @async
   * @param {string} auditId - Identifiant de l'audit.
   * @param {string} blockCode - Code du bloc.
   * @param {string} questionCode - Code de la question.
   * @returns {Promise<object | undefined>} Réponse si trouvée, sinon undefined.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const answer = await Answer.findOne('audit-123', 'financials', 'q1');
   */
  static async findOne(auditId, blockCode, questionCode) {
    const sql = `
      SELECT * FROM answers 
      WHERE audit_id = ? AND block_code = ? AND question_code = ?
    `;
    return await dbGet(sql, [auditId, blockCode, questionCode]);
  }

  /**
   * Crée ou met à jour une réponse.
   *
   * @async
   * @param {object} answerData - Données de réponse.
   * @param {string} answerData.audit_id - Identifiant de l'audit.
   * @param {string} answerData.block_code - Code du bloc.
   * @param {string} answerData.question_code - Code de la question.
   * @param {string | number | null} answerData.value - Valeur de la réponse.
   * @returns {Promise<object>} La réponse sauvegardée.
   * @throws {Error} Si l'insert ou l'update échoue.
   *
   * @example
   * const saved = await Answer.upsert({
   *   audit_id: 'audit-123',
   *   block_code: 'financials',
   *   question_code: 'q1',
   *   value: 42
   * });
   */
  static async upsert(answerData) {
    const { audit_id, block_code, question_code, value } = answerData;
    
    const existing = await this.findOne(audit_id, block_code, question_code);
    const now = new Date().toISOString();
    
    if (existing) {
      // Update
      const sql = `
        UPDATE answers 
        SET value = ?, updated_at = ?
        WHERE audit_id = ? AND block_code = ? AND question_code = ?
      `;
      await dbRun(sql, [value, now, audit_id, block_code, question_code]);
      return await this.findOne(audit_id, block_code, question_code);
    } else {
      // Insert
      const id = uuidv4();
      const sql = `
        INSERT INTO answers (id, audit_id, block_code, question_code, value, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await dbRun(sql, [id, audit_id, block_code, question_code, value, now, now]);
      return await this.findOne(audit_id, block_code, question_code);
    }
  }

  /**
   * Met à jour ou insère un lot de réponses.
   *
   * @async
   * @param {string} auditId - Identifiant de l'audit.
   * @param {object[]} answersArray - Tableau de réponses (block_code, question_code, value).
   * @returns {Promise<object[]>} Réponses sauvegardées.
   * @throws {Error} Si une des opérations échoue.
   *
   * @example
   * const saved = await Answer.bulkUpsert('audit-123', [
   *   { block_code: 'financials', question_code: 'q1', value: 10 }
   * ]);
   */
  static async bulkUpsert(auditId, answersArray) {
    const results = [];
    for (const answer of answersArray) {
      const result = await this.upsert({
        audit_id: auditId,
        ...answer
      });
      results.push(result);
    }
    return results;
  }

  /**
   * Supprime une réponse pour une question donnée.
   *
   * @async
   * @param {string} auditId - Identifiant de l'audit.
   * @param {string} blockCode - Code du bloc.
   * @param {string} questionCode - Code de la question.
   * @returns {Promise<boolean>} True si la suppression est effectuée.
   * @throws {Error} Si la suppression échoue.
   *
   * @example
   * await Answer.delete('audit-123', 'financials', 'q1');
   */
  static async delete(auditId, blockCode, questionCode) {
    const sql = `
      DELETE FROM answers 
      WHERE audit_id = ? AND block_code = ? AND question_code = ?
    `;
    await dbRun(sql, [auditId, blockCode, questionCode]);
    return true;
  }

  /**
   * Supprime toutes les réponses d'un audit.
   *
   * @async
   * @param {string} auditId - Identifiant de l'audit.
   * @returns {Promise<boolean>} True si la suppression est effectuée.
   * @throws {Error} Si la suppression échoue.
   *
   * @example
   * await Answer.deleteByAudit('audit-123');
   */
  static async deleteByAudit(auditId) {
    const sql = `DELETE FROM answers WHERE audit_id = ?`;
    await dbRun(sql, [auditId]);
    return true;
  }
}

module.exports = Answer;
