const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/FSA.html', (req, res) => res.redirect('/'));

const DATA_FILE = path.join(__dirname, 'data', 'database.json');
const DATA_DIR = path.join(__dirname, 'data');

const DEFAULT_DATA = {
  orders: [
    { id: 'ORD-1001', client: 'C5 Apparel', status: 'Pending', retoucher: 'Alex M.', qc: 'Sam T.', flag: ['None'], notes: '', revs: 0, eta: '2026-07-20', actualDelivery: '', owner: 'Mike', qcReviewer: 'Sam T.' },
    { id: 'ORD-1002', client: 'C5 Apparel', status: 'Revision Needed', retoucher: 'John D.', qc: 'Sam T.', flag: ['Over Retouched', 'Naming Error'], notes: 'Fix texture & filename', revs: 2, eta: '2026-07-10', actualDelivery: '', owner: 'Sarah', qcReviewer: 'Sam T.' }
  ],
  heroes: [
    { style: 'C914SS045_BLK', img: 'https://placehold.co/400x300/e2e8f0/64748b?text=Sample+Hero', date: '2026-06-15', notes: 'High contrast, clean white bg, natural skin texture.', approvedBy: 'Marilena' }
  ],
  comms: [
    { date: '2026-07-10', contact: 'Client Team', topic: 'Lighting Standards', resolution: 'Updated to slightly warmer tones.', followUp: 'N' }
  ]
};

function initDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf8');
    console.log('Created default database.json');
  }
}

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading data file, reinitializing:', e.message);
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

initDataFile();

app.get('/api/data', (req, res) => {
  res.json(readData());
});

app.put('/api/data', (req, res) => {
  try {
    writeData(req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/reset', (req, res) => {
  writeData(DEFAULT_DATA);
  res.json({ success: true, data: DEFAULT_DATA });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FSA Ops Tracker running on http://localhost:${PORT}`);
});
