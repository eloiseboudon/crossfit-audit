const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Modèle d'accès aux salles (gyms).
 */
class Gym {
  /**
   * Liste toutes les salles, ou celles d'un utilisateur.
   *
   * @param {string | null} [userId=null] - Identifiant de l'utilisateur.
   * @returns {object[]} Liste de salles triées par date.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const gyms = Gym.findAll('user-123');
   */
  static async findAll(userId = null) {
    let sql = `SELECT * FROM gyms ORDER BY created_at DESC`;
    let params = [];
    
    if (userId) {
      sql = `SELECT * FROM gyms WHERE user_id = ? ORDER BY created_at DESC`;
      params = [userId];
    }
    
    return dbAll(sql, params);
  }

  /**
   * Liste les salles accessibles à un utilisateur.
   *
   * @param {string} userId - Identifiant de l'utilisateur.
   * @returns {object[]} Salles avec niveau d'accès calculé.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const gyms = Gym.findAllForUser('user-123');
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
    return dbAll(sql, [userId, userId, userId, userId]);
  }

  /**
   * Récupère une salle par identifiant.
   *
   * @param {string} id - Identifiant de la salle.
   * @returns {object | null} Salle trouvée ou null.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const gym = Gym.findById('gym-123');
   */
  static async findById(id) {
    const sql = `SELECT * FROM gyms WHERE id = ?`;
    return dbGet(sql, [id]);
  }

  /**
   * Crée une nouvelle salle.
   *
   * @param {object} gymData - Données de la salle.
   * @param {string | null} [userId=null] - Propriétaire de la salle.
   * @returns {object | null} Salle créée.
   * @throws {Error} Si l'insert échoue.
   *
   * @example
   * const gym = Gym.create({ name: 'CrossFit Box' }, 'user-123');
   */
  static async create(gymData, userId = null) {
    const {
      name, address, city, postal_code, contact_name, phone, email,
      website, instagram, legal_status, founded_year, partners_count, notes
    } = gymData;

    if (!name) {
      throw new Error('Le nom de la salle est requis');
    }
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const sql = `
      INSERT INTO gyms (
        id, user_id, name, address, city, postal_code, contact_name, 
        phone, email, website, instagram, legal_status, founded_year, 
        partners_count, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    dbRun(sql, [
      id, userId, name, address, city, postal_code, contact_name,
      phone, email, website, instagram, legal_status, founded_year,
      partners_count, notes, now, now
    ]);
    
    return this.findById(id);
  }

  /**
   * Met à jour une salle existante.
   *
   * @param {string} id - Identifiant de la salle.
   * @param {object} gymData - Données à mettre à jour.
   * @returns {object | null} Salle mise à jour.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * const gym = Gym.update('gym-123', { city: 'Paris' });
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
    
    dbRun(sql, [
      name, address, city, postal_code, contact_name, phone, email,
      website, instagram, legal_status, founded_year, partners_count,
      notes, now, id
    ]);
    
    return this.findById(id);
  }

  /**
   * Supprime une salle.
   *
   * @param {string} id - Identifiant de la salle.
   * @returns {boolean} True si la suppression est effectuée.
   * @throws {Error} Si la suppression échoue.
   *
   * @example
   * Gym.delete('gym-123');
   */
  static async delete(id) {
    const sql = `DELETE FROM gyms WHERE id = ?`;
    dbRun(sql, [id]);
    return true;
  }

  /**
   * Récupère une salle avec ses statistiques (audits, concurrents, offres).
   *
   * @param {string} id - Identifiant de la salle.
   * @returns {object | null} Salle enrichie ou null si inexistante.
   * @throws {Error} Si une requête SQL échoue.
   *
   * @example
   * const gym = Gym.getWithStats('gym-123');
   */
  static async getWithStats(id) {
    const sql = `
      SELECT g.*,
        (SELECT COUNT(*) FROM audits WHERE gym_id = g.id) AS audits_count,
        (SELECT COUNT(*) FROM competitors WHERE gym_id = g.id AND is_active = 1) AS competitors_count,
        (SELECT COUNT(*) FROM gym_offers WHERE gym_id = g.id AND is_active = 1) AS offers_count
      FROM gyms g
      WHERE g.id = ?
    `;
    const gym = dbGet(sql, [id]);
    if (!gym) return null;

    const { audits_count, competitors_count, offers_count, ...gymData } = gym;

    return {
      ...gymData,
      stats: {
        audits_count,
        competitors_count,
        offers_count
      }
    };
  }
}

module.exports = Gym;
