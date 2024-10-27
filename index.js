const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const uuid = require('uuid');
const db = require('./db');
const generateQRCode = require('./generateQRCode');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const {expressjwt: jwt} = require('express-jwt');
const jwks = require('jwks-rsa')

const app = express();
app.use(express.json());

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.secretstring,
  baseURL: process.env.baseURL,
  clientID: process.env.clientID,
  issuerBaseURL: process.env.issuerBaseURL,
};

const checkToken = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://dev-ofxc3ousvrox0zmn.us.auth0.com/.well-known/jwks.json"
    }),
    audience: 'https://ticket-maker',
    issuerBaseURL: 'https://dev-ofxc3ousvrox0zmn.us.auth0.com/',
    algorithms: ['RS256']
  });

// Serve static files from the "styles" folder
app.use('/styles', express.static(path.join(__dirname, 'styles'))); 

app.use(auth(config));

// Homepage Route
app.get('/', (req, res) => {
    db.get(`SELECT COUNT(*) AS count FROM tickets`, (err, row) => {
      if (err) {
        return res.status(500).send('Error retrieving ticket count.');
      }
  
      // Read and send the HTML file, replacing {{ticketCount}} with the actual count
      const filePath = path.join(__dirname, 'modules', 'index.html');
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return res.status(500).send('Error loading page.');
        }
        const renderedHtml = data.replace('{{ticketCount}}', row.count);
        res.send(renderedHtml);
      });
    });
});

// Ticket Generation Endpoint
app.get('/tickets', checkToken, async (req, res) => {

  const { vatin, firstName, lastName } = req.body;
  if (!vatin || !firstName || !lastName) {
    return res.status(400).send('Missing required fields');
  }

db.get(`SELECT COUNT(*) as count FROM tickets WHERE vatin = ?`, [vatin], async (err, row) => {
if (err) return res.status(500).send('Database error');
if (row.count >= 3) return res.status(400).send('Ticket limit reached for this vatin');

const ticketId = uuid.v4();
const ticketUrl = `${process.env.baseURL}/tickets/${ticketId}`;

try {
    const qrCode = await generateQRCode(ticketUrl);
    db.run(`INSERT INTO tickets (id, vatin, firstName, lastName) VALUES (?, ?, ?, ?)`,
    [ticketId, vatin, firstName, lastName],
    (err) => {
        if (err) return res.status(500).send('Database error');
        //res.set('Content-type', 'image/png');
        res.send(qrCode);
    });
} catch {
    res.status(500).send('Failed to generate QR Code');
}
});
});

// Ticket Details Route (GET /tickets/:id)
app.get('/tickets/:id', requiresAuth(), (req, res) => {
    const { id } = req.params;
  
    db.get(`SELECT * FROM tickets WHERE id = ?`, [id], (err, row) => {
      if (err) return res.status(500).send('Error retrieving ticket data.');
      if (!row) return res.status(404).send('Ticket not found');
  
      // Read and render the HTML file
      const filePath = path.join(__dirname, 'modules', 'ticket.html');
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error loading page.');
  
        // Replace placeholders with actual data
        const renderedHtml = data
          .replace('{{currentUser}}', req.oidc.user.name)
          .replace('{{ticketId}}', row.id)
          .replace('{{vatin}}', row.vatin)
          .replace('{{firstName}}', row.firstName)
          .replace('{{lastName}}', row.lastName)
          .replace('{{createdAt}}', row.createdAt);
  
        res.send(renderedHtml);
      });
    });
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
