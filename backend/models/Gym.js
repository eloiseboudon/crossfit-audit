const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Gym {
  static async findAll(userId = null) {
    let sql = `SELECT * FROM gyms ORDER BY created_at DESC`;
    let params = [];
    
    if (userId) {
      sql = `SELECT * FROM gyms WHERE user_id = ? ORDER BY created_at DESC`;
      params = [userId];
    }
    
    return await dbAll(sql, params);
  }

  static async findById(id) {
    const sql = `SELECT * FROM gyms WHERE id = ?`;
    return await dbGet(sql, [id]);
  }

  static async create(gymData, userId = null) {
    const {
      name, address, city, postal_code, contact_name, phone, email,
      website, instagram, legal_status, founded_year, partners_count, notes
    } = gymData;
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const sql = `
      INSERT INTO gyms (
        id, user_id, name, address, city, postal_code, contact_name, 
        phone, email, website, instagram, legal_status, founded_year, 
        partners_count, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await dbRun(sql, [
      id, userId, name, address, city, postal_code, contact_name,
      phone, email, website, instagram, legal_status, founded_year,
      partners_count, notes, now, now
    ]);
    
    return await this.findById(id);
  }

  static async update(id, gymData) {
    const {
      name, address, city, postal_code, contact_name, phone, email,
      website, instagram, legal_status, founded_year, partners_count, notes
    } = gymData;
    
    const now = new Date().toISOString();
    
    const sql = `
      UPDATE gyms SET
        name = COALESCE(?, name),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        postal_code = COALESCE(?, postal_code),
        contact_name = COALESCE(?, contact_name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        website = COALESCE(?, website),
        instagram = COALESCE(?, instagram),
        legal_status = COALESCE(?, legal_status),
        founded_year = COALESCE(?, founded_year),
        partners_count = COALESCE(?, partners_count),
        notes = COALESCE(?, notes),
        updated_at = ?
      WHERE id = ?
    `;
    
    await dbRun(sql, [
      name, address, city, postal_code, contact_name, phone, email,
      website, instagram, legal_status, founded_year, partners_count,
      notes, now, id
    ]);
    
    return await this.findById(id);
  }

  static async delete(id) {
    const sql = `DELETE FROM gyms WHERE id = ?`;
    await dbRun(sql, [id]);
    return true;
  }

  static async getWithStats(id) {
    const gym = await this.findById(id);
    if (!gym) return null;

    // Compter les audits
    const auditCountSql = `SELECT COUNT(*) as count FROM audits WHERE gym_id = ?`;
    const auditCount = await dbGet(auditCountSql, [id]);

    // Compter les concurrents
    const competitorCountSql = `SELECT COUNT(*) as count FROM competitors WHERE gym_id = ? AND is_active = 1`;
    const competitorCount = await dbGet(competitorCountSql, [id]);

    // Compter les offres
    const offerCountSql = `SELECT COUNT(*) as count FROM gym_offers WHERE gym_id = ? AND is_active = 1`;
    const offerCount = await dbGet(offerCountSql, [id]);

    return {
      ...gym,
      stats: {
        audits_count: auditCount.count,
        competitors_count: competitorCount.count,
        offers_count: offerCount.count
      }
    };
  }
}

module.exports = Gym;
