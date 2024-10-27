
const express = require('express');
const db = require('./db');  // Import the database connection file

const app = express();


app.get('/', async (req, res) => {
  db.get(`SELECT COUNT(*) AS count FROM tickets`, (err, row) => {
    if (err) {
      return res.status(500).send('Error retrieving ticket count.');
    }
    res.send(`<h1>Total QR Tickets Generated: ${row.count}</h1>`);
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
