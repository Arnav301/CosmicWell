const bcrypt = require('bcryptjs');
const { getSupabase, isSupabaseConnected } = require('../config/supabase');

/**
 * Supabase User Model - for authentication only
 * All personal data (focus sessions, goals, sleep, etc.) stays local
 */
class SupabaseUser {
  /**
   * Create a new user
   */
  static async create({ email, username, password, displayName = null }) {
    if (!isSupabaseConnected()) {
      throw new Error('Supabase not connected');
    }
    
    const supabase = getSupabase();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        display_name: displayName || username,
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('email')) {
          throw new Error('Email already exists');
        }
        if (error.message.includes('username')) {
          throw new Error('Username already exists');
        }
      }
      throw error;
    }
    
    return this.formatUser(data);
  }
  
  /**
   * Find user by ID
   */
  static async findById(id) {
    if (!isSupabaseConnected()) return null;
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return this.formatUser(data);
  }
  
  /**
   * Find user by email (includes password for login verification)
   */
  static async findByEmail(email) {
    if (!isSupabaseConnected()) return null;
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error || !data) return null;
    return this.formatUser(data, true); // Include password
  }
  
  /**
   * Find user by username (includes password for login verification)
   */
  static async findByUsername(username) {
    if (!isSupabaseConnected()) return null;
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', username)
      .single();
    
    if (error || !data) return null;
    return this.formatUser(data, true); // Include password for login
  }
  
  /**
   * Update user
   */
  static async findByIdAndUpdate(id, updates) {
    if (!isSupabaseConnected()) return null;
    
    const supabase = getSupabase();
    
    // Convert camelCase to snake_case for Supabase
    const supabaseUpdates = {};
    if (updates.displayName !== undefined) supabaseUpdates.display_name = updates.displayName;
    if (updates.avatar !== undefined) supabaseUpdates.avatar = updates.avatar;
    if (updates.settings !== undefined) supabaseUpdates.settings = updates.settings;
    if (updates.isActive !== undefined) supabaseUpdates.is_active = updates.isActive;
    if (updates.password !== undefined) supabaseUpdates.password = updates.password;
    if (updates.lastLogin !== undefined) supabaseUpdates.last_login = updates.lastLogin;
    
    const { data, error } = await supabase
      .from('users')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return null;
    return this.formatUser(data);
  }
  
  /**
   * Delete user
   */
  static async findByIdAndDelete(id) {
    if (!isSupabaseConnected()) return null;
    
    const supabase = getSupabase();
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    return !error;
  }
  
  /**
   * Check if email exists
   */
  static async exists(query) {
    if (!isSupabaseConnected()) return null;
    
    const supabase = getSupabase();
    let q = supabase.from('users').select('id');
    
    if (query.email) {
      q = q.eq('email', query.email.toLowerCase());
    }
    if (query.username) {
      q = q.ilike('username', query.username);
    }
    
    const { data, error } = await q.single();
    return !error && data !== null;
  }
  
  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  /**
   * Format Supabase row to user object
   */
  static formatUser(row, includePassword = false) {
    const user = {
      id: row.id,
      email: row.email,
      username: row.username,
      displayName: row.display_name,
      avatar: row.avatar,
      isActive: row.is_active,
      settings: row.settings,
      lastLogin: row.last_login,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
    
    if (includePassword) {
      user.password = row.password;
    }
    
    return user;
  }
}

module.exports = SupabaseUser;
