// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tickets.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    vatin TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
