const { dbAll, dbGet, dbRun } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async findAll() {
    const sql = `
      SELECT id, email, name, role, is_active, created_at, updated_at 
      FROM users 
      WHERE is_active = 1
      ORDER BY created_at DESC
    `;
    return await dbAll(sql);
  }

  static async findById(id) {
    const sql = `
      SELECT id, email, name, role, is_active, created_at, updated_at 
      FROM users 
      WHERE id = ?
    `;
    return await dbGet(sql, [id]);
  }

  static async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    return await dbGet(sql, [email]);
  }

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

  static async delete(id) {
    const sql = `UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?`;
    const now = new Date().toISOString();
    await dbRun(sql, [now, id]);
    return true;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
