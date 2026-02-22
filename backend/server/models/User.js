const bcrypt = require('bcryptjs');
const { getDatabase } = require('../config/database');

class User {
  /**
   * Create a new user
   */
  static async create({ email, username, password, displayName = null }) {
    const db = getDatabase();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const stmt = db.prepare(`
      INSERT INTO users (email, username, password, displayName, isActive)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(email.toLowerCase(), username, hashedPassword, displayName || username, 1);
    
    return this.findById(result.lastInsertRowid);
  }
  
  /**
   * Find user by ID
   */
  static findById(id) {
    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, email, username, displayName, avatar, createdAt, updatedAt, lastLogin, isActive, settings
      FROM users WHERE id = ?
    `).get(id);
    
    if (user && user.settings) {
      user.settings = JSON.parse(user.settings);
    }
    
    return user;
  }
  
  /**
   * Find user by email
   */
  static findByEmail(email) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).get(email.toLowerCase());
  }
  
  /**
   * Find user by username
   */
  static findByUsername(username) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM users WHERE username = ?
    `).get(username);
  }
  
  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  /**
   * Update user
   */
  static update(id, updates) {
    const db = getDatabase();
    const allowedFields = ['displayName', 'avatar', 'settings', 'isActive'];
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(key === 'settings' ? JSON.stringify(value) : value);
      }
    }
    
    if (fields.length === 0) return this.findById(id);
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    db.prepare(`
      UPDATE users SET ${fields.join(', ')} WHERE id = ?
    `).run(...values);
    
    return this.findById(id);
  }
  
  /**
   * Update password
   */
  static async updatePassword(id, newPassword) {
    const db = getDatabase();
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    db.prepare(`
      UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `).run(hashedPassword, id);
    
    return true;
  }
  
  /**
   * Update last login time
   */
  static updateLastLogin(id) {
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?
    `).run(id);
  }
  
  /**
   * Delete user
   */
  static delete(id) {
    const db = getDatabase();
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return true;
  }
  
  /**
   * Check if email exists
   */
  static emailExists(email) {
    const db = getDatabase();
    const result = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email.toLowerCase());
    return !!result;
  }
  
  /**
   * Check if username exists
   */
  static usernameExists(username) {
    const db = getDatabase();
    const result = db.prepare('SELECT 1 FROM users WHERE username = ?').get(username);
    return !!result;
  }
}

module.exports = User;
