const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class GymAccess {
  static async findByGymAndUser(gymId, userId) {
    const sql = `
      SELECT id, gym_id, user_id, access_level, created_at, updated_at
      FROM gym_user_access
      WHERE gym_id = ? AND user_id = ?
    `;
    return await dbGet(sql, [gymId, userId]);
  }

  static async findByGymId(gymId) {
    const sql = `
      SELECT id, gym_id, user_id, access_level, created_at, updated_at
      FROM gym_user_access
      WHERE gym_id = ?
      ORDER BY created_at DESC
    `;
    return await dbAll(sql, [gymId]);
  }

  static async upsert(gymId, userId, accessLevel) {
    const existing = await this.findByGymAndUser(gymId, userId);
    const now = new Date().toISOString();

    if (existing) {
      const sql = `
        UPDATE gym_user_access
        SET access_level = ?, updated_at = ?
        WHERE id = ?
      `;
      await dbRun(sql, [accessLevel, now, existing.id]);
      return await this.findByGymAndUser(gymId, userId);
    }

    const id = uuidv4();
    const sql = `
      INSERT INTO gym_user_access (id, gym_id, user_id, access_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await dbRun(sql, [id, gymId, userId, accessLevel, now, now]);
    return await this.findByGymAndUser(gymId, userId);
  }

  static async remove(gymId, userId) {
    const sql = `DELETE FROM gym_user_access WHERE gym_id = ? AND user_id = ?`;
    await dbRun(sql, [gymId, userId]);
    return true;
  }
}

module.exports = GymAccess;
