require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'wonjuga-secret-2024';

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
app.use(limiter);

const db = sqlite3('wonjuga.db');

// CREATE TABLE
db.exec(`
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idNumber TEXT UNIQUE NOT NULL,
  fullName TEXT,
  phone TEXT NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'member',
  department TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// SEED ADMIN IF NOT EXISTS
const adminExists = db.prepare(`SELECT * FROM members WHERE idNumber =?`).get('GH/ADMIN001');
if (!adminExists) {
  db.prepare(`INSERT INTO members (idNumber, fullName, phone, role) VALUES (?,?,?,?)`)
   .run('GH/ADMIN001', 'System Admin', '0550000001', 'admin');
  console.log('Admin seeded: GH/ADMIN001 / 0550000001');
}

app.get('/', (req, res) => {
  res.send('WONJUGA server is live ✨ - API at /api/login');
});

// ===== THIS FIXES YOUR 404 =====
app.post('/api/login', (req, res) => {
  const { idNumber, phone, password } = req.body;
  if (!idNumber ||!phone) return res.status(400).json({ error: 'idNumber and phone required' });

  const user = db.prepare(`SELECT * FROM members WHERE idNumber =? AND phone =?`).get(idNumber.trim(), phone.trim());

  if (!user) return res.status(401).json({ error: 'Invalid service number or phone' });

  // If you have password in DB, check it. If not, skip
  if (user.password && password) {
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ id: user.id, idNumber: user.idNumber, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, idNumber: user.idNumber, fullName: user.fullName, role: user.role, phone: user.phone } });
});

function auth(req, res, next) {
  const h = req.headers['authorization'];
  if (!h) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(h.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/members', auth, (req, res) => {
  const rows = db.prepare(`SELECT id, idNumber, fullName, phone, role, department, createdAt FROM members ORDER BY id DESC`).all();
  res.json(rows);
});

app.get('/api/me', auth, (req, res) => {
  const me = db.prepare(`SELECT id, idNumber, fullName, phone, role, department FROM members WHERE id =?`).get(req.user.id);
  res.json(me);
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));