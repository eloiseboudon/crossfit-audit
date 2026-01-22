const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Answer {
  static async findByAuditId(auditId) {
    const sql = `
      SELECT * FROM answers 
      WHERE audit_id = ? 
      ORDER BY block_code, question_code
    `;
    return await dbAll(sql, [auditId]);
  }

  static async findByAuditAndBlock(auditId, blockCode) {
    const sql = `
      SELECT * FROM answers 
      WHERE audit_id = ? AND block_code = ?
      ORDER BY question_code
    `;
    return await dbAll(sql, [auditId, blockCode]);
  }

  static async findOne(auditId, blockCode, questionCode) {
    const sql = `
      SELECT * FROM answers 
      WHERE audit_id = ? AND block_code = ? AND question_code = ?
    `;
    return await dbGet(sql, [auditId, blockCode, questionCode]);
  }

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

  static async delete(auditId, blockCode, questionCode) {
    const sql = `
      DELETE FROM answers 
      WHERE audit_id = ? AND block_code = ? AND question_code = ?
    `;
    await dbRun(sql, [auditId, blockCode, questionCode]);
    return true;
  }

  static async deleteByAudit(auditId) {
    const sql = `DELETE FROM answers WHERE audit_id = ?`;
    await dbRun(sql, [auditId]);
    return true;
  }
}

module.exports = Answer;
