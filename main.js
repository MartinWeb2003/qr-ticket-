// Ensure this is within your main app file (e.g., index.js)

// Import required modules
const express = require('express');
const db = require('./db');  // Import the database connection file

const app = express();

// Homepage Route
app.get('/', async (req, res) => {
  db.get(`SELECT COUNT(*) AS count FROM tickets`, (err, row) => {
    if (err) {
      return res.status(500).send('Error retrieving ticket count.');
    }
    // Respond with the total number of tickets
    res.send(`<h1>Total QR Tickets Generated: ${row.count}</h1>`);
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
