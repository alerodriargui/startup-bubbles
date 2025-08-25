// backend/index.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Datos de ejemplo en memoria
let startups = [
  { id: 1, name: 'Startup A', sector: 'Tech', stage: 'Seed', valuation: 10 },
  { id: 2, name: 'Startup B', sector: 'Health', stage: 'Series A', valuation: 25 },
  { id: 3, name: 'Startup C', sector: 'Fintech', stage: 'Series B', valuation: 40 },
  { id: 4, name: 'Startup D', sector: 'AI', stage: 'Seed', valuation: 15 },
];

// Endpoint para obtener startups
app.get('/api/startups', (req, res) => {
  res.json(startups);
});

// Endpoint para añadir startup
app.post('/api/startups', (req, res) => {
  const newStartup = { id: startups.length + 1, ...req.body };
  startups.push(newStartup);
  res.json(newStartup);
});

app.listen(3001, () => {
  console.log('Servidor backend corriendo en http://localhost:3001');
});
