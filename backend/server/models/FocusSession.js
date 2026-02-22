const { getDatabase } = require('../config/database');

class FocusSession {
  /**
   * Create a new focus session
   */
  static create({ userId, task, duration, wasLocked = false }) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO focus_sessions (userId, task, duration, wasLocked, startTime)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    
    const result = stmt.run(userId, task, duration, wasLocked ? 1 : 0);
    return this.findById(result.lastInsertRowid);
  }
  
  /**
   * Find session by ID
   */
  static findById(id) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM focus_sessions WHERE id = ?
    `).get(id);
  }
  
  /**
   * Find sessions by user ID
   */
  static findByUserId(userId, { limit = 50, offset = 0, startDate = null, endDate = null } = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM focus_sessions WHERE userId = ?';
    const params = [userId];
    
    if (startDate) {
      query += ' AND startTime >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND startTime <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY startTime DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    return db.prepare(query).all(...params);
  }
  
  /**
   * End a focus session
   */
  static end(id, { actualDuration, completed = false }) {
    const db = getDatabase();
    
    db.prepare(`
      UPDATE focus_sessions 
      SET actualDuration = ?, completed = ?, endTime = datetime('now')
      WHERE id = ?
    `).run(actualDuration, completed ? 1 : 0, id);
    
    return this.findById(id);
  }
  
  /**
   * Get user statistics
   */
  static getStats(userId, period = 'week') {
    const db = getDatabase();
    
    let dateFilter;
    switch (period) {
      case 'today':
        dateFilter = "date(startTime) = date('now')";
        break;
      case 'week':
        dateFilter = "startTime >= datetime('now', '-7 days')";
        break;
      case 'month':
        dateFilter = "startTime >= datetime('now', '-30 days')";
        break;
      case 'year':
        dateFilter = "startTime >= datetime('now', '-365 days')";
        break;
      default:
        dateFilter = "1=1";
    }
    
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as totalSessions,
        COALESCE(SUM(COALESCE(actualDuration, duration)), 0) as totalDuration,
        COALESCE(AVG(COALESCE(actualDuration, duration)), 0) as avgDuration,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completedSessions
      FROM focus_sessions 
      WHERE userId = ? AND ${dateFilter}
    `).get(userId);
    
    return stats;
  }
  
  /**
   * Get daily totals for a period
   */
  static getDailyTotals(userId, days = 7) {
    const db = getDatabase();
    
    return db.prepare(`
      SELECT 
        date(startTime) as date,
        COUNT(*) as sessions,
        COALESCE(SUM(COALESCE(actualDuration, duration)), 0) as totalDuration
      FROM focus_sessions 
      WHERE userId = ? AND startTime >= datetime('now', '-${days} days')
      GROUP BY date(startTime)
      ORDER BY date DESC
    `).all(userId);
  }
  
  /**
   * Delete a session
   */
  static delete(id, userId) {
    const db = getDatabase();
    db.prepare('DELETE FROM focus_sessions WHERE id = ? AND userId = ?').run(id, userId);
    return true;
  }
}

module.exports = FocusSession;
