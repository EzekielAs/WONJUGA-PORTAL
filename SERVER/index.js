const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = new Database(path.join(__dirname, 'wonjuga.db'));

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'wonjuga-secret-2026';
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(rateLimit({windowMs:15*60*1000,max:200}));

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, service_number TEXT UNIQUE NOT NULL,
    full_name TEXT, phone TEXT NOT NULL, rank TEXT, unit TEXT,
    role TEXT DEFAULT 'member', status TEXT DEFAULT 'active',
    momo_number TEXT, total_paid REAL DEFAULT 0,
    last_payment_date TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER,
    amount REAL, month TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);