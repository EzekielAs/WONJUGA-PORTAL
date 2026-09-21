const sqlite3=require('sqlite3').verbose();
const path=require('path');
const db=new sqlite3.Database(path.join(__dirname,'wonjuga.db'));
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
    db.run('DELETE FROM users');
    db.run('DELETE FROM payments');
    db.run('DELETE FROM announcements');
    db.run("INSERT INTO users(service_number,full_name,phone,role,rank,unit,momo_number,total_paid) VALUES('GH/ADMIN001','Main Admin','0550000001','admin','Commander','HQ Kumasi','0550000001',0)");
    db.run("INSERT INTO users(service_number,full_name,phone,role,rank,unit,momo_number,total_paid) VALUES('GH/00001','Kwame Mensah','0551111111','member','Officer','Kumasi Unit','0551111111',0)", ()=>{
      console.log('SEEDED OK: GH/ADMIN001 / 0550000001');
      process.exit();
    });
  });
});