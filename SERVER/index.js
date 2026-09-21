require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const db = sqlite3('wonjuga.db');

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(rateLimit({windowMs:15*60*1000, max:200}));

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_number TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT NOT NULL,
    rank TEXT,
    unit TEXT,
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'active',
    momo_number TEXT,
    total_paid REAL DEFAULT 0,
    last_payment_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    month TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

app.get('/', (req,res) => {
    res.send('WONJUGA API is Live!');
});

app.post('/api/login', (req,res) => {
    const { service_number, phone } = req.body;
    try {
        const user = db.prepare('SELECT * FROM users WHERE service_number = ?').get(service_number);
        if(!user) return res.status(404).json({message: 'User not found'});
        // simple check for now
        const token = jwt.sign({id:user.id, role:user.role}, process.env.JWT_SECRET || 'secret123', {expiresIn:'7d'});
        res.json({token, user});
    } catch(e){
        res.status(500).json({error:e.message});
    }
});

app.get('/api/users', (req,res) => {
    const users = db.prepare('SELECT * FROM users').all();
    res.json(users);
});

// THIS IS THE IMPORTANT PART THAT WAS MISSING
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});