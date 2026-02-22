const bcrypt = require('bcryptjs');
const { getDatabase } = require('../config/database');
const { isSupabaseConnected } = require('../config/supabase');
const SupabaseUser = require('./SupabaseUser');

/**
 * Hybrid User Model
 * - Uses Supabase when online (cloud auth)
 * - Falls back to local SQLite when offline
 */
class User {
  /**
   * Create a new user
   */
  static async create({ email, username, password, displayName = null }) {
    // Try Supabase first (cloud)
    if (isSupabaseConnected()) {
      try {
        const supabaseUser = await SupabaseUser.create({
          email: email.toLowerCase(),
          username,
          password,
          displayName: displayName || username
        });
        
        console.log('☁️ User created in Supabase:', supabaseUser.id);
        return supabaseUser;
      } catch (error) {
        console.error('Supabase create failed, falling back to local:', error.message);
      }
    }
    
    // Fallback to local storage
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
  static async findById(id) {
    // Try Supabase first
    if (isSupabaseConnected()) {
      try {
        const supabaseUser = await SupabaseUser.findById(id);
        if (supabaseUser) {
          return supabaseUser;
        }
      } catch (error) {
        // Not a valid Supabase ID or connection issue
      }
    }
    
    // Fallback to local
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
  static async findByEmail(email) {
    const normalizedEmail = email.toLowerCase();
    
    // Try Supabase first
    if (isSupabaseConnected()) {
      try {
        const supabaseUser = await SupabaseUser.findByEmail(normalizedEmail);
        if (supabaseUser) {
          return supabaseUser;
        }
      } catch (error) {
        console.error('Supabase findByEmail failed:', error.message);
      }
    }
    
    // Fallback to local
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).get(normalizedEmail);
  }
  
  /**
   * Find user by username
   */
  static async findByUsername(username) {
    // Try Supabase first
    if (isSupabaseConnected()) {
      try {
        const supabaseUser = await SupabaseUser.findByUsername(username);
        if (supabaseUser) {
          return supabaseUser;
        }
      } catch (error) {
        console.error('Supabase findByUsername failed:', error.message);
      }
    }
    
    // Fallback to local
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM users WHERE username = ? COLLATE NOCASE
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
  static async update(id, updates) {
    const allowedFields = ['displayName', 'avatar', 'settings', 'isActive'];
    const filteredUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }
    
    if (Object.keys(filteredUpdates).length === 0) {
      return this.findById(id);
    }
    
    // Try Supabase first
    if (isSupabaseConnected()) {
      try {
        const supabaseUser = await SupabaseUser.findByIdAndUpdate(id, filteredUpdates);
        if (supabaseUser) {
          return supabaseUser;
        }
      } catch (error) {
        console.error('Supabase update failed:', error.message);
      }
    }
    
    // Fallback to local
    const db = getDatabase();
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(filteredUpdates)) {
      fields.push(`${key} = ?`);
      values.push(key === 'settings' ? JSON.stringify(value) : value);
    }
    
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
    // Try Supabase first
    if (isSupabaseConnected()) {
      try {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await SupabaseUser.findByIdAndUpdate(id, { password: hashedPassword });
        return true;
      } catch (error) {
        console.error('Supabase updatePassword failed:', error.message);
      }
    }
    
    // Fallback to local
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
  static async updateLastLogin(id) {
    // Try Supabase first
    if (isSupabaseConnected()) {
      try {
        await SupabaseUser.findByIdAndUpdate(id, { lastLogin: new Date().toISOString() });
        return;
      } catch (error) {
        // Ignore, not critical
      }
    }
    
    // Fallback to local
    const db = getDatabase();
    db.prepare(`
      UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?
    `).run(id);
  }
  
  /**
   * Delete user
   */
  static async delete(id) {
    // Try Supabase first
    if (isSupabaseConnected()) {
      try {
        await SupabaseUser.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error('Supabase delete failed:', error.message);
      }
    }
    
    // Fallback to local
    const db = getDatabase();
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return true;
  }
  
  /**
   * Check if email exists
   */
  static async emailExists(email) {
    const normalizedEmail = email.toLowerCase();
    
    // Try Supabase first
    if (isSupabaseConnected()) {
      try {
        const exists = await SupabaseUser.exists({ email: normalizedEmail });
        if (exists) return true;
      } catch (error) {
        console.error('Supabase emailExists failed:', error.message);
      }
    }
    
    // Also check local
    const db = getDatabase();
    const result = db.prepare('SELECT 1 FROM users WHERE email = ?').get(normalizedEmail);
    return !!result;
  }
  
  /**
   * Check if username exists
   */
  static async usernameExists(username) {
    // Try Supabase first
    if (isSupabaseConnected()) {
      try {
        const exists = await SupabaseUser.exists({ username });
        if (exists) return true;
      } catch (error) {
        console.error('Supabase usernameExists failed:', error.message);
      }
    }
    
    // Also check local
    const db = getDatabase();
    const result = db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE').get(username);
    return !!result;
  }
}

module.exports = User;
