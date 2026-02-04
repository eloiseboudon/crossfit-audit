const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Modèle d'accès aux permissions d'une salle.
 */
class GymAccess {
  /**
   * Récupère l'accès d'un utilisateur pour une salle.
   *
   * @async
   * @param {string} gymId - Identifiant de la salle.
   * @param {string} userId - Identifiant de l'utilisateur.
   * @returns {Promise<object | undefined>} Droit d'accès ou undefined.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const access = await GymAccess.findByGymAndUser('gym-123', 'user-123');
   */
  static async findByGymAndUser(gymId, userId) {
    const sql = `
      SELECT id, gym_id, user_id, access_level, created_at, updated_at
      FROM gym_user_access
      WHERE gym_id = ? AND user_id = ?
    `;
    return await dbGet(sql, [gymId, userId]);
  }

  /**
   * Liste les accès d'une salle.
   *
   * @async
   * @param {string} gymId - Identifiant de la salle.
   * @returns {Promise<object[]>} Liste des accès.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const accesses = await GymAccess.findByGymId('gym-123');
   */
  static async findByGymId(gymId) {
    const sql = `
      SELECT id, gym_id, user_id, access_level, created_at, updated_at
      FROM gym_user_access
      WHERE gym_id = ?
      ORDER BY created_at DESC
    `;
    return await dbAll(sql, [gymId]);
  }

  /**
   * Crée ou met à jour l'accès d'un utilisateur à une salle.
   *
   * @async
   * @param {string} gymId - Identifiant de la salle.
   * @param {string} userId - Identifiant de l'utilisateur.
   * @param {string} accessLevel - Niveau d'accès (read/write).
   * @returns {Promise<object>} Accès sauvegardé.
   * @throws {Error} Si l'upsert échoue.
   *
   * @example
   * const access = await GymAccess.upsert('gym-123', 'user-123', 'write');
   */
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

  /**
   * Supprime l'accès d'un utilisateur à une salle.
   *
   * @async
   * @param {string} gymId - Identifiant de la salle.
   * @param {string} userId - Identifiant de l'utilisateur.
   * @returns {Promise<boolean>} True si la suppression est effectuée.
   * @throws {Error} Si la suppression échoue.
   *
   * @example
   * await GymAccess.remove('gym-123', 'user-123');
   */
  static async remove(gymId, userId) {
    const sql = `DELETE FROM gym_user_access WHERE gym_id = ? AND user_id = ?`;
    await dbRun(sql, [gymId, userId]);
    return true;
  }
}

module.exports = GymAccess;
