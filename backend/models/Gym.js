const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Modèle d'accès aux salles (gyms).
 */
class Gym {
  /**
   * Liste toutes les salles, ou celles d'un utilisateur.
   *
   * @async
   * @param {string | null} [userId=null] - Identifiant de l'utilisateur.
   * @returns {Promise<object[]>} Liste de salles triées par date.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const gyms = await Gym.findAll('user-123');
   */
  static async findAll(userId = null) {
    let sql = `SELECT * FROM gyms ORDER BY created_at DESC`;
    let params = [];
    
    if (userId) {
      sql = `SELECT * FROM gyms WHERE user_id = ? ORDER BY created_at DESC`;
      params = [userId];
    }
    
    return await dbAll(sql, params);
  }

  /**
   * Liste les salles accessibles à un utilisateur.
   *
   * @async
   * @param {string} userId - Identifiant de l'utilisateur.
   * @returns {Promise<object[]>} Salles avec niveau d'accès calculé.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const gyms = await Gym.findAllForUser('user-123');
   */
  static async findAllForUser(userId) {
    const sql = `
      SELECT g.*, 
        CASE 
          WHEN g.user_id = ? THEN 'owner'
          ELSE ga.access_level
        END AS access_level
      FROM gyms g
      LEFT JOIN gym_user_access ga
        ON ga.gym_id = g.id AND ga.user_id = ?
      WHERE g.user_id = ? OR ga.user_id = ?
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `;
    return await dbAll(sql, [userId, userId, userId, userId]);
  }

  /**
   * Récupère une salle par identifiant.
   *
   * @async
   * @param {string} id - Identifiant de la salle.
   * @returns {Promise<object | undefined>} Salle trouvée ou undefined.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const gym = await Gym.findById('gym-123');
   */
  static async findById(id) {
    const sql = `SELECT * FROM gyms WHERE id = ?`;
    return await dbGet(sql, [id]);
  }

  /**
   * Crée une nouvelle salle.
   *
   * @async
   * @param {object} gymData - Données de la salle.
   * @param {string | null} [userId=null] - Propriétaire de la salle.
   * @returns {Promise<object>} Salle créée.
   * @throws {Error} Si l'insert échoue.
   *
   * @example
   * const gym = await Gym.create({ name: 'CrossFit Box' }, 'user-123');
   */
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

  /**
   * Met à jour une salle existante.
   *
   * @async
   * @param {string} id - Identifiant de la salle.
   * @param {object} gymData - Données à mettre à jour.
   * @returns {Promise<object>} Salle mise à jour.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * const gym = await Gym.update('gym-123', { city: 'Paris' });
   */
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

  /**
   * Supprime une salle.
   *
   * @async
   * @param {string} id - Identifiant de la salle.
   * @returns {Promise<boolean>} True si la suppression est effectuée.
   * @throws {Error} Si la suppression échoue.
   *
   * @example
   * await Gym.delete('gym-123');
   */
  static async delete(id) {
    const sql = `DELETE FROM gyms WHERE id = ?`;
    await dbRun(sql, [id]);
    return true;
  }

  /**
   * Récupère une salle avec ses statistiques (audits, concurrents, offres).
   *
   * @async
   * @param {string} id - Identifiant de la salle.
   * @returns {Promise<object | null>} Salle enrichie ou null si inexistante.
   * @throws {Error} Si une requête SQL échoue.
   *
   * @example
   * const gym = await Gym.getWithStats('gym-123');
   */
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
