const path = require('path');
const fs = require('fs');
const config = require('./index');

// JSON file-based database (no native compilation needed)
class JsonDatabase {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.data = {
      users: [],
      focus_sessions: [],
      daily_goals: [],
      sleep_records: [],
      app_usage: [],
      notifications: [],
      refresh_tokens: []
    };
    this.counters = {
      users: 0,
      focus_sessions: 0,
      daily_goals: 0,
      sleep_records: 0,
      app_usage: 0,
      notifications: 0,
      refresh_tokens: 0
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const saved = JSON.parse(raw);
        this.data = saved.data || this.data;
        this.counters = saved.counters || this.counters;
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading database:', err);
      this.save();
    }
  }

  save() {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dbPath, JSON.stringify({ data: this.data, counters: this.counters }, null, 2));
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  // Prepare-like interface for compatibility
  prepare(sql) {
    const db = this;
    return {
      run(...params) {
        return db._executeWrite(sql, params);
      },
      get(...params) {
        return db._executeRead(sql, params, true);
      },
      all(...params) {
        return db._executeRead(sql, params, false);
      }
    };
  }

  exec(sql) {
    // For table creation - not needed with JSON storage
    return this;
  }

  pragma() {
    return this;
  }

  _getTable(sql) {
    const match = sql.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
    return match ? match[1] : null;
  }

  _executeWrite(sql, params) {
    const table = this._getTable(sql);
    if (!table || !this.data[table]) return { lastInsertRowid: 0 };

    if (sql.toLowerCase().includes('insert')) {
      const id = ++this.counters[table];
      const record = this._parseInsert(sql, params, id);
      this.data[table].push(record);
      this.save();
      return { lastInsertRowid: id };
    }

    if (sql.toLowerCase().includes('update')) {
      this._parseUpdate(sql, params, table);
      this.save();
      return { changes: 1 };
    }

    if (sql.toLowerCase().includes('delete')) {
      this._parseDelete(sql, params, table);
      this.save();
      return { changes: 1 };
    }

    return { lastInsertRowid: 0 };
  }

  _executeRead(sql, params, single) {
    const table = this._getTable(sql);
    if (!table || !this.data[table]) return single ? undefined : [];

    let results = [...this.data[table]];

    // Handle WHERE clauses
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/i);
    if (whereMatch) {
      results = this._applyWhere(results, whereMatch[1], params);
    }

    // Handle ORDER BY
    const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)\s*(DESC|ASC)?/i);
    if (orderMatch) {
      const field = orderMatch[1];
      const desc = orderMatch[2]?.toUpperCase() === 'DESC';
      results.sort((a, b) => {
        if (desc) return a[field] > b[field] ? -1 : 1;
        return a[field] < b[field] ? -1 : 1;
      });
    }

    // Handle LIMIT
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      results = results.slice(0, parseInt(limitMatch[1]));
    }

    // Handle OFFSET
    const offsetMatch = sql.match(/OFFSET\s+(\d+)/i);
    if (offsetMatch) {
      const limit = limitMatch ? parseInt(limitMatch[1]) : results.length;
      const offset = parseInt(offsetMatch[1]);
      results = results.slice(offset, offset + limit);
    }

    return single ? results[0] : results;
  }

  _applyWhere(data, whereClause, params) {
    return data.filter(record => {
      let paramIndex = 0;
      const conditions = whereClause.split(/\s+AND\s+/i);
      return conditions.every(cond => {
        const eqMatch = cond.match(/(\w+)\s*=\s*\?/);
        if (eqMatch) {
          const field = eqMatch[1];
          const value = params[paramIndex++];
          if (cond.toUpperCase().includes('COLLATE NOCASE') && typeof record[field] === 'string' && typeof value === 'string') {
            return record[field].toLowerCase() === value.toLowerCase();
          }
          return record[field] == value;
        }
        const geMatch = cond.match(/(\w+)\s*>=\s*\?/);
        if (geMatch) {
          const field = geMatch[1];
          const value = params[paramIndex++];
          return record[field] >= value;
        }
        const leMatch = cond.match(/(\w+)\s*<=\s*\?/);
        if (leMatch) {
          const field = leMatch[1];
          const value = params[paramIndex++];
          return record[field] <= value;
        }
        return true;
      });
    });
  }

  _parseInsert(sql, params, id) {
    const colsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
    if (!colsMatch) return { id };

    const columns = colsMatch[1].split(',').map(c => c.trim());
    const record = { id, createdAt: new Date().toISOString() };
    
    columns.forEach((col, i) => {
      if (params[i] !== undefined) {
        record[col] = params[i];
      }
    });
    
    return record;
  }

  _parseUpdate(sql, params, table) {
    const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
    const whereMatch = sql.match(/WHERE\s+(.+)/i);
    
    if (!setMatch || !whereMatch) return;

    const setClauses = setMatch[1].split(',').map(s => s.trim());
    const paramCount = setClauses.length;
    
    this.data[table] = this.data[table].map(record => {
      // Check if record matches WHERE
      const conditions = whereMatch[1].split(/\s+AND\s+/i);
      let matches = true;
      let whereParamIdx = paramCount;
      
      conditions.forEach(cond => {
        const match = cond.match(/(\w+)\s*=\s*\?/);
        if (match && record[match[1]] != params[whereParamIdx++]) {
          matches = false;
        }
      });
      
      if (!matches) return record;
      
      // Apply SET
      setClauses.forEach((clause, i) => {
        const match = clause.match(/(\w+)\s*=\s*\?/);
        if (match) {
          record[match[1]] = params[i];
        }
      });
      
      record.updatedAt = new Date().toISOString();
      return record;
    });
  }

  _parseDelete(sql, params, table) {
    const whereMatch = sql.match(/WHERE\s+(.+)/i);
    if (!whereMatch) return;

    this.data[table] = this.data[table].filter(record => {
      let paramIdx = 0;
      const conditions = whereMatch[1].split(/\s+AND\s+/i);
      return !conditions.every(cond => {
        const match = cond.match(/(\w+)\s*=\s*\?/);
        if (match) {
          return record[match[1]] == params[paramIdx++];
        }
        return true;
      });
    });
  }

  close() {
    this.save();
  }
}

let db = null;

const initDatabase = () => {
  try {
    const dbPath = path.resolve(__dirname, '../../', config.database.path.replace('.db', '.json'));
    db = new JsonDatabase(dbPath);
    console.log('📦 JSON database connected');
    return db;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};

const getDatabase = () => {
  if (!db) {
    return initDatabase();
  }
  return db;
};

const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
    console.log('📦 Database connection closed');
  }
};

module.exports = {
  getDatabase,
  closeDatabase,
  initDatabase
};
