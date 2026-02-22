const { getDatabase } = require('../config/database');

class SleepRecord {
  /**
   * Create a new sleep record
   */
  static create({ userId, sleepTime, wakeTime, quality = null, notes = null }) {
    const db = getDatabase();
    
    // Calculate duration in minutes
    const sleepDate = new Date(sleepTime);
    const wakeDate = new Date(wakeTime);
    const duration = Math.round((wakeDate - sleepDate) / (1000 * 60));
    
    const stmt = db.prepare(`
      INSERT INTO sleep_records (userId, sleepTime, wakeTime, duration, quality, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(userId, sleepTime, wakeTime, duration, quality, notes);
    return this.findById(result.lastInsertRowid);
  }
  
  /**
   * Find record by ID
   */
  static findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM sleep_records WHERE id = ?').get(id);
  }
  
  /**
   * Find records by user ID
   */
  static findByUserId(userId, { limit = 30, offset = 0, startDate = null, endDate = null } = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM sleep_records WHERE userId = ?';
    const params = [userId];
    
    if (startDate) {
      query += ' AND sleepTime >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND sleepTime <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY sleepTime DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    return db.prepare(query).all(...params);
  }
  
  /**
   * Get sleep statistics
   */
  static getStats(userId, days = 7) {
    const db = getDatabase();
    
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as totalRecords,
        COALESCE(AVG(duration), 0) as avgDuration,
        COALESCE(AVG(quality), 0) as avgQuality,
        MIN(duration) as minDuration,
        MAX(duration) as maxDuration
      FROM sleep_records 
      WHERE userId = ? AND sleepTime >= datetime('now', '-${days} days')
    `).get(userId);
    
    // Calculate average sleep and wake times
    const times = db.prepare(`
      SELECT 
        strftime('%H', sleepTime) as sleepHour,
        strftime('%H', wakeTime) as wakeHour
      FROM sleep_records 
      WHERE userId = ? AND sleepTime >= datetime('now', '-${days} days')
    `).all(userId);
    
    if (times.length > 0) {
      const avgSleepHour = Math.round(times.reduce((sum, t) => sum + parseInt(t.sleepHour), 0) / times.length);
      const avgWakeHour = Math.round(times.reduce((sum, t) => sum + parseInt(t.wakeHour), 0) / times.length);
      stats.avgSleepHour = avgSleepHour;
      stats.avgWakeHour = avgWakeHour;
    }
    
    return stats;
  }
  
  /**
   * Get weekly sleep data
   */
  static getWeeklyData(userId) {
    const db = getDatabase();
    
    return db.prepare(`
      SELECT 
        date(sleepTime) as date,
        duration,
        quality
      FROM sleep_records 
      WHERE userId = ? AND sleepTime >= datetime('now', '-7 days')
      ORDER BY sleepTime DESC
    `).all(userId);
  }
  
  /**
   * Update a record
   */
  static update(id, userId, updates) {
    const db = getDatabase();
    const allowedFields = ['sleepTime', 'wakeTime', 'quality', 'notes'];
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    // Recalculate duration if times updated
    if (updates.sleepTime || updates.wakeTime) {
      const current = this.findById(id);
      const sleepTime = updates.sleepTime || current.sleepTime;
      const wakeTime = updates.wakeTime || current.wakeTime;
      const duration = Math.round((new Date(wakeTime) - new Date(sleepTime)) / (1000 * 60));
      fields.push('duration = ?');
      values.push(duration);
    }
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id, userId);
    
    db.prepare(`
      UPDATE sleep_records SET ${fields.join(', ')} WHERE id = ? AND userId = ?
    `).run(...values);
    
    return this.findById(id);
  }
  
  /**
   * Delete a record
   */
  static delete(id, userId) {
    const db = getDatabase();
    db.prepare('DELETE FROM sleep_records WHERE id = ? AND userId = ?').run(id, userId);
    return true;
  }
}

module.exports = SleepRecord;
