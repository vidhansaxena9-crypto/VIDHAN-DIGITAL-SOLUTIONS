const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbDir = path.join(__dirname, 'data');
const dbPath = path.join(dbDir, 'vidhan.db');

fs.mkdirSync(dbDir, { recursive: true });

let db;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection failed:', err.message);
        throw err;
      }
    });
  }
  return db;
}

function initializeDb() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.serialize(() => {
      database.run(
        `CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          business TEXT,
          service TEXT,
          budget TEXT,
          message TEXT NOT NULL,
          created_at TEXT NOT NULL
        )`,
        (err) => {
          if (err) return reject(err);
          database.all('PRAGMA table_info(contacts)', (infoErr, rows) => {
            if (infoErr) return reject(infoErr);
            const columns = rows.map(r => r.name);
            const alterOps = [];
            if (!columns.includes('service')) {
              alterOps.push(new Promise((resolveAlter, rejectAlter) => {
                database.run('ALTER TABLE contacts ADD COLUMN service TEXT', (alterErr) => {
                  if (alterErr) return rejectAlter(alterErr);
                  resolveAlter();
                });
              }));
            }
            if (!columns.includes('budget')) {
              alterOps.push(new Promise((resolveAlter, rejectAlter) => {
                database.run('ALTER TABLE contacts ADD COLUMN budget TEXT', (alterErr) => {
                  if (alterErr) return rejectAlter(alterErr);
                  resolveAlter();
                });
              }));
            }
            Promise.all(alterOps).then(() => resolve()).catch(reject);
          });
        }
      );
    });
  });
}

function saveContact({ name, email, business, service, budget, message }) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    const createdAt = new Date().toISOString();
    database.run(
      'INSERT INTO contacts (name, email, business, service, budget, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, business || '', service || '', budget || '', message, createdAt],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, createdAt });
      }
    );
  });
}

function getContacts() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all(
      'SELECT id, name, email, business, service, budget, message, created_at FROM contacts ORDER BY id DESC LIMIT 50',
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

function deleteContact(id) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.run('DELETE FROM contacts WHERE id = ?', [id], function (err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
}

module.exports = {
  initializeDb,
  saveContact,
  getContacts,
  getDb,
  deleteContact,
};
