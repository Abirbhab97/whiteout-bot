const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./giftcodes.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      status TEXT DEFAULT 'active',
      first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_checked DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function saveCode(code) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO codes(code) VALUES(?)`,
      [code],
      function (err) {
        if (err) reject(err);
        resolve(this.changes > 0);
      }
    );
  });
}

function markExpired(code) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE codes SET status='expired' WHERE code=?`,
      [code],
      function (err) {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

function getActiveCodes() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT code FROM codes WHERE status='active'`,
      [],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(r => r.code));
      }
    );
  });
}

function getAllCodes() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT code, status FROM codes`, [], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

function updateLastChecked(code) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE codes SET last_checked=CURRENT_TIMESTAMP WHERE code=?`,
      [code],
      function (err) {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

module.exports = {
  saveCode,
  markExpired,
  getActiveCodes,
  getAllCodes,
  updateLastChecked
};
