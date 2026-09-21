const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'wonjuga.db'));
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'wonjuga-secret-2026';
const PORT = process.env.PORT || 8080;
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({windowMs:15*60*1000,max:200}));

const db = new sqlite3.Database(path.join(__dirname, 'wonjuga.db'), ...
  if(err) console.error(err); else console.log('SQLITE CONNECTED');
});

db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, service_number TEXT UNIQUE NOT NULL,
    full_name TEXT, phone TEXT NOT NULL, rank TEXT, unit TEXT,
    role TEXT DEFAULT 'member', status TEXT DEFAULT 'active',
    momo_number TEXT, total_paid REAL DEFAULT 0,
    last_payment_date TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER,
    service_number TEXT, amount REAL, month TEXT,
    momo_number TEXT, momo_network TEXT,
    transaction_id TEXT, receipt_no TEXT UNIQUE,
    status TEXT DEFAULT 'success', created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, message TEXT,
    type TEXT DEFAULT 'info', posted_by TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`, ()=>{
    // AUTO SEED IF EMPTY
    db.get('SELECT COUNT(*) as c FROM users', (e,r)=>{
      if(r.c===0){
        db.run("INSERT INTO users(service_number,full_name,phone,role,rank,unit,momo_number) VALUES('GH/ADMIN001','Main Admin','0550000001','admin','Commander','HQ Kumasi','0550000001')");
        db.run("INSERT INTO users(service_number,full_name,phone,role,rank,unit,momo_number) VALUES('GH/00001','Kwame Mensah','0551111111','member','Officer','Kumasi Unit','0551111111')", ()=>{
          console.log('*** AUTO SEEDED GH/ADMIN001 / 0550000001 ***');
        });
      } else {
        console.log('USERS EXIST: '+r.c);
      }
    });
  });
  console.log('TABLES READY');
});

const protect=(req,res,next)=>{
  const t=req.headers.authorization?.split(' ')[1];
  if(!t) return res.status(401).json({error:'No token'});
  try{ req.user=jwt.verify(t,process.env.JWT_SECRET||'wonjuga_super_secret_123'); next(); }catch{ res.status(401).json({error:'Invalid token'}) }
}
const isAdmin=(req,res,next)=>{
  if(req.user.role!=='admin'&&req.user.role!=='executive') return res.status(403).json({error:'Access denied'});
  next();
}

app.post('/api/login', (req,res)=>{
  let {serviceNumber, phone}=req.body;
  serviceNumber=(serviceNumber||'').trim().toUpperCase();
  phone=(phone||'').trim();
  console.log('LOGIN ATTEMPT:', serviceNumber, phone);
  db.get('SELECT * FROM users WHERE UPPER(TRIM(service_number))=UPPER(?) AND TRIM(phone)=?', [serviceNumber, phone], (e,row)=>{
    if(e) console.log(e);
    console.log('FOUND:', row);
    if(!row) return res.status(401).json({error:'Invalid Service Number or Phone'});
    const token=jwt.sign({id:row.id, serviceNumber:row.service_number, role:row.role}, process.env.JWT_SECRET||'wonjuga_super_secret_123', {expiresIn:'7d'});
    res.json({token, role:row.role, user:{id:row.id, serviceNumber:row.service_number, fullName:row.full_name, phone:row.phone, role:row.role, unit:row.unit, rank:row.rank, totalPaid:row.total_paid, lastPaymentDate:row.last_payment_date, momoNumber:row.momo_number}});
  });
});

app.post('/api/members', protect, isAdmin, (req,res)=>{
  const {serviceNumber, fullName, phone, rank, unit, role, momoNumber}=req.body;
  db.run('INSERT INTO users(service_number,full_name,phone,rank,unit,role,momo_number) VALUES(?,?,?,?,?,?,?)', [serviceNumber.toUpperCase().trim(),fullName,phone.trim(),rank,unit,role||'member',momoNumber||phone.trim()], function(e){
    if(e) return res.status(400).json({error:e.message});
    db.get('SELECT * FROM users WHERE id=?', [this.lastID], (e2,row)=>res.json(row));
  });
});
app.get('/api/members', protect, isAdmin, (req,res)=>{ db.all('SELECT * FROM users ORDER BY created_at DESC', (e,rows)=>res.json(rows)); });
app.post('/api/pay', protect, (req,res)=>{
  const {amount, month, momoNumber, network}=req.body;
  db.get('SELECT * FROM users WHERE id=?', [req.user.id], (e,user)=>{
    if(!user) return res.status(404).json({error:'User not found'});
    if((momoNumber||'').trim()!==user.phone.trim() && (momoNumber||'').trim()!==(user.momo_number||'').trim()) return res.status(400).json({error:'MoMo must match registered number - Anti-scam'});
    const receiptNo='WONJUGA-'+Date.now();
    const transactionId='MOMO-'+Math.floor(Math.random()*1e9);
    db.run('INSERT INTO payments(user_id,service_number,amount,month,momo_number,momo_network,transaction_id,receipt_no) VALUES(?,?,?,?,?,?,?,?)', [user.id, user.service_number, amount, month, momoNumber.trim(), network, transactionId, receiptNo], function(e2){
      if(e2) return res.status(400).json({error:e2.message});
      db.run('UPDATE users SET total_paid = total_paid +?, last_payment_date=datetime("now") WHERE id=?', [amount, user.id]);
      db.get('SELECT * FROM payments WHERE id=?', [this.lastID], (e3,row)=>res.json({payment:row}));
    });
  });
});
app.get('/api/my-payments', protect, (req,res)=>{ db.all('SELECT * FROM payments WHERE user_id=? ORDER BY created_at DESC', [req.user.id], (e,rows)=>res.json(rows)); });
app.get('/api/all-payments', protect, isAdmin, (req,res)=>{ db.all('SELECT * FROM payments ORDER BY created_at DESC', (e,rows)=>res.json(rows)); });
app.post('/api/announcements', protect, isAdmin, (req,res)=>{ const {title, message}=req.body; db.run('INSERT INTO announcements(title,message,posted_by) VALUES(?,?,?)', [title,message,req.user.serviceNumber], function(e){ db.get('SELECT * FROM announcements WHERE id=?', [this.lastID], (e2,row)=>res.json(row)); }); });
app.get('/api/announcements', protect, (req,res)=>{ db.all('SELECT * FROM announcements ORDER BY created_at DESC', (e,rows)=>res.json(rows)); });
app.get('/api/stats', protect, isAdmin, (req,res)=>{ db.get("SELECT COUNT(*) as c FROM users WHERE role='member'", (e1,r1)=>{ db.get('SELECT SUM(amount) as total FROM payments', (e2,r2)=>{ res.json({totalMembers:r1.c, totalCollected:r2.total||0}); }); }); });
app.get('/api/debug-users', (req,res)=>{ db.all('SELECT service_number, phone, role FROM users', (e,rows)=>res.json(rows)); });

app.listen(process.env.PORT||8080, ()=>console.log('WONJUGA SQLITE RUNNING on http://localhost:'+(process.env.PORT||8080)));