import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCHBnObf0aoJ3p5c9auGvis1kYiE_3_1pg",
  authDomain: "gis-wonjuga-welfare.firebaseapp.com",
  projectId: "gis-wonjuga-welfare",
  storageBucket: "gis-wonjuga-welfare.firebasestorage.app",
  messagingSenderId: "1081669579126",
  appId: "1:1081669579126:web:c11b84dc5609162f65ca57"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [view, setView] = useState('dashboard')
  const [contributions, setContributions] = useState([])
  const [requests, setRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [form, setForm] = useState({name:'', phone:'', reason:''})

  useEffect(()=>{
    onSnapshot(collection(db, "contributions"), s=>setContributions(s.docs.map(d=>d.data())))
    onSnapshot(collection(db, "welfareRequests"), s=>setRequests(s.docs.map(d=>d.data())))
    onSnapshot(collection(db, "notifications"), s=>setNotifications(s.docs.map(d=>d.data())))
  },[])

  const total = contributions.reduce((a,b)=>a+Number(b.amount||0),0)

  const submitAccess = async ()=>{
    if(!form.name || !form.phone) return alert("Fill name and phone")
    await addDoc(collection(db, "welfareRequests"), {...form, date: new Date().toLocaleDateString(), status:'Pending'})
    alert("✅ Request Sent! Executives will approve you.")
    setForm({name:'', phone:'', reason:''})
    setView('dashboard')
  }

  const sendNotification = async ()=>{
    const msg = prompt("Enter notification for all members:")
    if(!msg) return
    await addDoc(collection(db, "notifications"), {message: msg, date: new Date().toLocaleDateString(), timestamp: Date.now()})
    alert("Notification sent to all 7 points!")
  }

  return (
    <div style={{fontFamily:'Segoe UI', background:'#f4f6f8', minHeight:'100vh'}}>
      {/* HEADER */}
      <div style={{background:'#0b6e4f', color:'white', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <b>GIS WONJUGA WELFARE</b>
        <button onClick={()=>setView('request')} style={{background:'white', color:'#0b6e4f', border:'none', padding:'8px 14px', borderRadius:20, fontWeight:'bold', cursor:'pointer'}}>Request Access</button>
      </div>

      {view === 'dashboard' && (
        <div style={{padding:20, maxWidth:900, margin:'auto'}}>
          <h2 style={{margin:'10px 0'}}>Dashboard - 7 Points</h2>
          <p style={{color:'#666', marginTop:0}}>Total Contributions: <b style={{color:'#0b6e4f'}}>GHS {total.toLocaleString()}</b> | Members: {contributions.length}</p>
          
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:16}}>
            {[
              {t:'Contributions', i:'💰', d:`GHS ${total}`, c:'#e8f5e9'},
              {t:'Members Directory', i:'👥', d:`${contributions.length} Members`, c:'#e3f2fd'},
              {t:'Welfare Requests', i:'🙏', d:`${requests.length} Requests`, c:'#fff3e0'},
              {t:'Events & Dues', i:'📅', d:'Upcoming Meeting', c:'#f3e5f5'},
              {t:'Financial Report', i:'📊', d:'View Report', c:'#e0f2f1'},
              {t:'Constitution', i:'📜', d:'Read Rules', c:'#fce4ec'},
              {t:'Notifications', i:'🔔', d:`${notifications.length} Alerts`, c:'#fffde7', action: true},
            ].map((card, idx)=>(
              <div key={idx} onClick={()=> idx===6 ? setView('notifications') : idx===0 ? setView('contributions') : idx===2 ? setView('requests') : null} style={{background:card.c, padding:18, borderRadius:14, cursor:'pointer', border: idx===6 ? '2px solid #ffb300' : '1px solid #eee', position:'relative'}}>
                <div style={{fontSize:28}}>{card.i}</div>
                <div style={{fontWeight:'bold', marginTop:8}}>{card.t}</div>
                <div style={{fontSize:12, color:'#555', marginTop:4}}>{card.d}</div>
                {card.action && <button onClick={(e)=>{e.stopPropagation(); sendNotification()}} style={{marginTop:10, background:'#ffb300', border:'none', padding:'6px 10px', borderRadius:6, fontSize:11, fontWeight:'bold'}}> + SEND ALERT</button>}
              </div>
            ))}
          </div>

          <div style={{marginTop:20, background:'white', padding:16, borderRadius:12}}>
            <h3>Recent Contributions (Live from Firebase)</h3>
            {contributions.slice(0,5).map((m,i)=><div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee'}}><span>{m.name}</span><b>GHS {m.amount}</b></div>)}
          </div>
        </div>
      )}

      {view === 'contributions' && (
        <div style={{padding:20, maxWidth:500, margin:'auto'}}>
          <button onClick={()=>setView('dashboard')} style={{marginBottom:10}}>← Back to Dashboard (7 Points)</button>
          <h2>All Contributions</h2>
          {contributions.map((m,i)=><div key={i} style={{background:'white', padding:12, marginBottom:8, borderRadius:8, display:'flex', justifyContent:'space-between'}}><span>{m.name} - {m.date}</span><b>GHS {m.amount}</b></div>)}
        </div>
      )}

      {view === 'requests' && (
        <div style={{padding:20, maxWidth:500, margin:'auto'}}>
          <button onClick={()=>setView('dashboard')} style={{marginBottom:10}}>← Back to Dashboard</button>
          <h2>Welfare Requests</h2>
          {requests.map((r,i)=><div key={i} style={{background:'white', padding:12, marginBottom:8, borderRadius:8}}><b>{r.name}</b> - {r.phone}<br/><small>{r.reason}</small><br/><span style={{fontSize:11, background:'#ffecb3', padding:'2px 6px', borderRadius:4}}>{r.status}</span></div>)}
        </div>
      )}

      {view === 'notifications' && (
        <div style={{padding:20, maxWidth:500, margin:'auto'}}>
          <button onClick={()=>setView('dashboard')} style={{marginBottom:10}}>← Back to Dashboard</button>
          <h2>🔔 Notifications - 7th Point</h2>
          <button onClick={sendNotification} style={{width:'100%', padding:12, background:'#0b6e4f', color:'white', border:'none', borderRadius:8, marginBottom:12}}>SEND NEW NOTIFICATION TO ALL</button>
          {notifications.sort((a,b)=>b.timestamp-a.timestamp).map((n,i)=><div key={i} style={{background:'#fff9c4', padding:12, marginBottom:8, borderRadius:8, borderLeft:'4px solid #ffb300'}}><b>{n.date}</b><p style={{margin:'6px 0 0 0'}}>{n.message}</p></div>)}
          {notifications.length===0 && <p>No notifications yet. Be first to send!</p>}
        </div>
      )}

      {view === 'request' && (
        <div style={{padding:20, maxWidth:500, margin:'auto'}}>
          <button onClick={()=>setView('dashboard')} style={{marginBottom:10}}>← Back</button>
          <div style={{background:'white', padding:20, borderRadius:12}}>
            <h2>Request Access</h2>
            <p>New member? Request to join GIS WONJUGA WELFARE</p>
            <input placeholder="Full Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}}/>
            <input placeholder="Phone Number" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}}/>
            <textarea placeholder="Reason to join / Welfare need" value={form.reason} onChange={e=>setForm({...form, reason:e.target.value})} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc', minHeight:80, boxSizing:'border-box'}}/>
            <button onClick={submitAccess} style={{width:'100%', padding:14, background:'#0b6e4f', color:'white', border:'none', borderRadius:8, fontWeight:'bold'}}>SUBMIT REQUEST</button>
          </div>
        </div>
      )}
    </div>
  )
}
export default App
