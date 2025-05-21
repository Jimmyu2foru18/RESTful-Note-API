const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const User = require('../../models/user.model');
const Note = require('../../models/note.model');

class SqliteStorage {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.initializeDatabase();
  }

  initializeDatabase() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err.message);
        return;
      }
      console.log('Connected to SQLite database at', this.dbPath);
      this.createTables();
    });
  }

  createTables() {
    const userTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `;

    const noteTable = `
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `;

    this.db.serialize(() => {
      this.db.run(userTable, (err) => {
        if (err) console.error('Error creating users table:', err.message);
      });
      
      this.db.run(noteTable, (err) => {
        if (err) console.error('Error creating notes table:', err.message);
      });
    });
  }

  async saveUser(user) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO users (id, username, password, created_at) VALUES (?, ?, ?, ?)';
      this.db.run(
        sql, 
        [user.id, user.username, user.password, user.createdAt.toISOString()],
        function(err) {
          if (err) return reject(err);
          resolve(user);
        }
      );
    });
  }

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ?';
      this.db.get(sql, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        
        const user = new User(row.username, row.password);
        user.id = row.id;
        user.createdAt = new Date(row.created_at);
        
        resolve(user);
      });
    });
  }

  async getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE LOWER(username) = LOWER(?)';
      this.db.get(sql, [username], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        
        const user = new User(row.username, row.password);
        user.id = row.id;
        user.createdAt = new Date(row.created_at);
        
        resolve(user);
      });
    });
  }

  async saveNote(note) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO notes (id, user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';
      this.db.run(
        sql, 
        [
          note.id, 
          note.userId, 
          note.title, 
          note.content, 
          note.createdAt.toISOString(), 
          note.updatedAt.toISOString()
        ],
        function(err) {
          if (err) return reject(err);
          resolve(note);
        }
      );
    });
  }

  async getNoteById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM notes WHERE id = ?';
      this.db.get(sql, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        
        const note = new Note(row.user_id, row.title, row.content);
        note.id = row.id;
        note.createdAt = new Date(row.created_at);
        note.updatedAt = new Date(row.updated_at);
        
        resolve(note);
      });
    });
  }

  async getNotesByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC';
      this.db.all(sql, [userId], (err, rows) => {
        if (err) return reject(err);
        
        const notes = rows.map(row => {
          const note = new Note(row.user_id, row.title, row.content);
          note.id = row.id;
          note.createdAt = new Date(row.created_at);
          note.updatedAt = new Date(row.updated_at);
          return note;
        });
        
        resolve(notes);
      });
    });
  }

  async updateNote(id, title, content) {
    return new Promise((resolve, reject) => {
      const updatedAt = new Date().toISOString();
      const sql = 'UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?';
      
      this.db.run(sql, [title, content, updatedAt, id], async function(err) {
        if (err) return reject(err);
        if (this.changes === 0) return resolve(null);
        
        try {
          const note = await this.getNoteById(id);
          resolve(note);
        } catch (error) {
          reject(error);
        }
      }.bind(this));
    });
  }

  async deleteNote(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM notes WHERE id = ?';
      this.db.run(sql, [id], function(err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  async clearAll() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('DELETE FROM notes', (err) => {
          if (err) return reject(err);
        });
        this.db.run('DELETE FROM users', (err) => {
          if (err) return reject(err);
          resolve(true);
        });
      });
    });
  }
}

module.exports = SqliteStorage;