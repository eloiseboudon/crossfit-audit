const { dbAll, dbGet, dbRun } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Modèle d'accès aux utilisateurs.
 */
class User {
  /**
   * Liste tous les utilisateurs actifs.
   *
   * @async
   * @returns {Promise<object[]>} Liste des utilisateurs.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const users = await User.findAll();
   */
  static async findAll() {
    const sql = `
      SELECT id, email, name, role, is_active, created_at, updated_at 
      FROM users 
      WHERE is_active = 1
      ORDER BY created_at DESC
    `;
    return await dbAll(sql);
  }

  /**
   * Récupère un utilisateur par identifiant.
   *
   * @async
   * @param {string} id - Identifiant de l'utilisateur.
   * @returns {Promise<object | undefined>} Utilisateur trouvé ou undefined.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const user = await User.findById('user-123');
   */
  static async findById(id) {
    const sql = `
      SELECT id, email, name, role, is_active, created_at, updated_at 
      FROM users 
      WHERE id = ?
    `;
    return await dbGet(sql, [id]);
  }

  /**
   * Récupère un utilisateur par email.
   *
   * @async
   * @param {string} email - Adresse email.
   * @returns {Promise<object | undefined>} Utilisateur trouvé ou undefined.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const user = await User.findByEmail('demo@example.com');
   */
  static async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    return await dbGet(sql, [email]);
  }

  /**
   * Crée un nouvel utilisateur.
   *
   * @async
   * @param {object} userData - Données utilisateur.
   * @param {string} userData.email - Adresse email.
   * @param {string} userData.password - Mot de passe en clair.
   * @param {string} userData.name - Nom affiché.
   * @param {string} [userData.role='user'] - Rôle de l'utilisateur.
   * @returns {Promise<object>} Utilisateur créé.
   * @throws {Error} Si l'email existe déjà ou si l'insert échoue.
   *
   * @example
   * const user = await User.create({ email: 'demo@example.com', password: 'Secret', name: 'Demo' });
   */
  static async create(userData) {
    const { email, password, name, role = 'user' } = userData;
    
    // Vérifier si l'email existe déjà
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const sql = `
      INSERT INTO users (id, email, password, name, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `;
    
    await dbRun(sql, [id, email, hashedPassword, name, role, now, now]);
    
    return await this.findById(id);
  }

  /**
   * Met à jour les informations d'un utilisateur.
   *
   * @async
   * @param {string} id - Identifiant de l'utilisateur.
   * @param {object} userData - Données à mettre à jour.
   * @returns {Promise<object>} Utilisateur mis à jour.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * const user = await User.update('user-123', { role: 'admin' });
   */
  static async update(id, userData) {
    const { name, role } = userData;
    const now = new Date().toISOString();
    
    const sql = `
      UPDATE users 
      SET name = COALESCE(?, name),
          role = COALESCE(?, role),
          updated_at = ?
      WHERE id = ?
    `;
    
    await dbRun(sql, [name, role, now, id]);
    return await this.findById(id);
  }

  /**
   * Met à jour le mot de passe d'un utilisateur.
   *
   * @async
   * @param {string} id - Identifiant de l'utilisateur.
   * @param {string} newPassword - Nouveau mot de passe en clair.
   * @returns {Promise<boolean>} True si la mise à jour est effectuée.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * await User.updatePassword('user-123', 'NewSecret');
   */
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const now = new Date().toISOString();
    
    const sql = `
      UPDATE users 
      SET password = ?, updated_at = ?
      WHERE id = ?
    `;
    
    await dbRun(sql, [hashedPassword, now, id]);
    return true;
  }

  /**
   * Désactive un utilisateur (suppression logique).
   *
   * @async
   * @param {string} id - Identifiant de l'utilisateur.
   * @returns {Promise<boolean>} True si la suppression est effectuée.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * await User.delete('user-123');
   */
  static async delete(id) {
    const sql = `UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?`;
    const now = new Date().toISOString();
    await dbRun(sql, [now, id]);
    return true;
  }

  /**
   * Vérifie un mot de passe en clair contre un hash.
   *
   * @async
   * @param {string} plainPassword - Mot de passe en clair.
   * @param {string} hashedPassword - Hash stocké.
   * @returns {Promise<boolean>} True si le mot de passe est correct.
   * @throws {Error} Si la comparaison échoue.
   *
   * @example
   * const ok = await User.verifyPassword('Secret', user.password);
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
