const { getDatabase } = require('../config/database');

class DailyGoal {
  /**
   * Create a new daily goal
   */
  static create({ userId, title, description = null, targetDate, priority = 'medium', category = null }) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO daily_goals (userId, title, description, targetDate, priority, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(userId, title, description, targetDate, priority, category);
    return this.findById(result.lastInsertRowid);
  }
  
  /**
   * Find goal by ID
   */
  static findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM daily_goals WHERE id = ?').get(id);
  }
  
  /**
   * Find goals by user ID
   */
  static findByUserId(userId, { limit = 50, offset = 0, completed = null, targetDate = null } = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM daily_goals WHERE userId = ?';
    const params = [userId];
    
    if (completed !== null) {
      query += ' AND completed = ?';
      params.push(completed ? 1 : 0);
    }
    
    if (targetDate) {
      query += ' AND targetDate = ?';
      params.push(targetDate);
    }
    
    query += ' ORDER BY targetDate DESC, priority DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    return db.prepare(query).all(...params);
  }
  
  /**
   * Get goals for today
   */
  static getTodayGoals(userId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM daily_goals 
      WHERE userId = ? AND targetDate = date('now')
      ORDER BY priority DESC, createdAt ASC
    `).all(userId);
  }
  
  /**
   * Update a goal
   */
  static update(id, userId, updates) {
    const db = getDatabase();
    const allowedFields = ['title', 'description', 'targetDate', 'priority', 'category'];
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id, userId);
    
    db.prepare(`
      UPDATE daily_goals SET ${fields.join(', ')} WHERE id = ? AND userId = ?
    `).run(...values);
    
    return this.findById(id);
  }
  
  /**
   * Mark goal as completed
   */
  static markCompleted(id, userId, completed = true) {
    const db = getDatabase();
    
    db.prepare(`
      UPDATE daily_goals 
      SET completed = ?, completedAt = ${completed ? "datetime('now')" : 'NULL'}
      WHERE id = ? AND userId = ?
    `).run(completed ? 1 : 0, id, userId);
    
    return this.findById(id);
  }
  
  /**
   * Get completion stats
   */
  static getStats(userId, days = 7) {
    const db = getDatabase();
    
    return db.prepare(`
      SELECT 
        COUNT(*) as totalGoals,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completedGoals,
        ROUND(AVG(CASE WHEN completed = 1 THEN 100.0 ELSE 0 END), 1) as completionRate
      FROM daily_goals 
      WHERE userId = ? AND targetDate >= date('now', '-${days} days')
    `).get(userId);
  }
  
  /**
   * Delete a goal
   */
  static delete(id, userId) {
    const db = getDatabase();
    db.prepare('DELETE FROM daily_goals WHERE id = ? AND userId = ?').run(id, userId);
    return true;
  }
}

module.exports = DailyGoal;
