import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'

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
  const [form, setForm] = useState({name:'', phone:'', serviceNo:''})
  const [adminForm, setAdminForm] = useState({name:'', phone:'', serviceNo:'', rank:''})
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLogin, setAdminLogin] = useState({user:'', pass:''})

  useEffect(()=>{
    onSnapshot(collection(db, "contributions"), s=>setContributions(s.docs.map(d=>({id:d.id, ...d.data()}))))
    onSnapshot(collection(db, "welfareRequests"), s=>setRequests(s.docs.map(d=>({id:d.id, ...d.data()}))))
    onSnapshot(collection(db, "notifications"), s=>setNotifications(s.docs.map(d=>({id:d.id, ...d.data()}))))
  },[])

  const total = contributions.reduce((a,b)=>a+Number(b.amount||0),0)

  // ADMIN LOGIN CHECK
  const handleAdminLogin = ()=>{
    if(adminLogin.user === 'admin' && adminLogin.pass === 'wonjuga123'){
      setIsAdmin(true)
      setView('admin')
      alert('✅ Admin Login Successful!')
    } else {
      alert('❌ Wrong! Use admin / wonjuga123')
    }
  }

  const submitAccess = async ()=>{
    if(!form.name || !form.phone) return alert("Fill name and phone")
    await addDoc(collection(db, "welfareRequests"), {...form, date: new Date().toLocaleDateString(), status:'Pending', timestamp: Date.now()})
    alert("✅ Request Sent!")
    setForm({name:'', phone:'', serviceNo:''})
    setView('dashboard')
  }

  const addMemberByAdmin = async ()=>{
    if(!adminForm.name || !adminForm.serviceNo) return alert("Fill Name and Service No")
    await addDoc(collection(db, "contributions"), {
      name: adminForm.name,
      phone: adminForm.phone,
      serviceNo: adminForm.serviceNo,
      rank: adminForm.rank,
      amount: 0,
      date: new Date().toLocaleDateString(),
      addedBy: 'Admin',
      timestamp: Date.now()
    })
    alert(`✅ ${adminForm.name} ADDED as member by Admin!`)
    setAdminForm({name:'', phone:'', serviceNo:'', rank:''})
  }

  const approveRequest = async (req)=>{
     const rejectRequest = async (req)=>{
    if(!confirm(`Reject ${req.name} ? This will DELETE the request.`)) return
    try{
      await deleteDoc(doc(db, "welfareRequests", req.id))
      alert(`✅ ${req.name} DELETED!`)
    } catch(e){
      alert("Error: " + e.message + " - Fix Firestore Rules!")
    }
  }
    await updateDoc(doc(db, "welfareRequests", req.id), {status: 'Approved'})
    await addDoc(collection(db, "contributions"), {name: req.name, phone: req.phone, serviceNo: req.serviceNo, amount: 0, date: new Date().toLocaleDateString()})
    alert(`✅ ${req.name} APPROVED!`)
  }

  return (
    <div style={{fontFamily:'Segoe UI', background:'#f4f6f8', minHeight:'100vh'}}>
      <div style={{background:'#0b6e4f', color:'white', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <b onClick={()=>setView('dashboard')} style={{cursor:'pointer', fontSize:13}}>GIS WONJUGA WELFARE</b>
        <div style={{display:'flex', gap:6}}>
          {!isAdmin && <button onClick={()=>setView('adminLogin')} style={{background:'#ffb300', color:'black', border:'none', padding:'6px 12px', borderRadius:20, fontWeight:'bold', fontSize:11}}>ADMIN LOGIN</button>}
          {isAdmin && <button onClick={()=>setView('admin')} style={{background:'white', color:'#0b6e4f', border:'none', padding:'6px 12px', borderRadius:20, fontWeight:'bold', fontSize:11}}>ADMIN PANEL</button>}
          <button onClick={()=>setView('request')} style={{background:'white', color:'#0b6e4f', border:'none', padding:'6px 12px', borderRadius:20, fontWeight:'bold', fontSize:11}}>Request Access</button>
        </div>
      </div>

      {view === 'dashboard' && (
        <div style={{padding:16, maxWidth:900, margin:'auto'}}>
          <h3>Dashboard - 7 Points {isAdmin && "(ADMIN MODE)"}</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:12}}>
            {[
              {t:'Contributions', i:'💰', d:`GHS ${total}`, go:'dashboard'},
              {t:'Members Directory', i:'👥', d:`${contributions.length} Members`, go:'members'},
              {t:'Welfare Requests', i:'🙏', d:`${requests.filter(r=>r.status==='Pending').length} Pending`, go:'requests'},
              {t:'Events & Dues', i:'📅', d:'Meetings', go:'dashboard'},
              {t:'Financial Report', i:'📊', d:'Report', go:'dashboard'},
              {t:'Constitution', i:'📜', d:'Rules', go:'dashboard'},
              {t:'Notifications', i:'🔔', d:`${notifications.length} Alerts`, go:'notifications'},
            ].map((c,i)=><div key={i} onClick={()=>setView(c.go)} style={{background:'white', padding:14, borderRadius:12, border:'1px solid #eee'}}><div style={{fontSize:22}}>{c.i}</div><div style={{fontWeight:'bold', fontSize:13, marginTop:4}}>{c.t}</div><div style={{fontSize:11, color:'#666'}}>{c.d}</div></div>)}
          </div>
          <div style={{marginTop:16, background:'white', padding:14, borderRadius:12}}>
            <h4 style={{margin:0}}>Recent Members (Live)</h4>
            {contributions.slice(0,5).map((m,i)=><div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee', fontSize:13}}><span>{m.name} - {m.serviceNo}</span><b>{m.phone}</b></div>)}
          </div>
        </div>
      )}

      {view === 'adminLogin' && (
        <div style={{padding:20, maxWidth:400, margin:'50px auto'}}>
          <div style={{background:'white', padding:20, borderRadius:12, boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
            <h2>🔐 Admin Login</h2>
            <p style={{fontSize:12, color:'#666'}}>Login to add members directly</p>
            <input placeholder="Username: admin" value={adminLogin.user} onChange={e=>setAdminLogin({...adminLogin, user:e.target.value})} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}}/>
            <input placeholder="Password: wonjuga123" type="password" value={adminLogin.pass} onChange={e=>setAdminLogin({...adminLogin, pass:e.target.value})} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}}/>
            <button onClick={handleAdminLogin} style={{width:'100%', padding:14, background:'#0b6e4f', color:'white', border:'none', borderRadius:8, fontWeight:'bold'}}>LOGIN</button>
            <button onClick={()=>setView('dashboard')} style={{width:'100%', marginTop:8, padding:10, background:'#eee', border:'none', borderRadius:8}}>Back</button>
          </div>
        </div>
      )}

      {view === 'admin' && (
        <div style={{padding:16, maxWidth:600, margin:'auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><button onClick={()=>setView('dashboard')}>← Dashboard</button><button onClick={()=>{setIsAdmin(false); setView('dashboard')}} style={{background:'#dc3545', color:'white', border:'none', padding:'6px 10px', borderRadius:6}}>Logout Admin</button></div>
          <h2>👑 Admin Panel - Add Members Directly</h2>
          <div style={{background:'white', padding:16, borderRadius:12, border:'2px solid #0b6e4f'}}>
            <h4 style={{marginTop:0}}>Add New Member (Before Request)</h4>
            <input placeholder="Full Name *" value={adminForm.name} onChange={e=>setAdminForm({...adminForm, name:e.target.value})} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}}/>
            <input placeholder="Phone Number" value={adminForm.phone} onChange={e=>setAdminForm({...adminForm, phone:e.target.value})} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}}/>
            <input placeholder="Service Number *" value={adminForm.serviceNo} onChange={e=>setAdminForm({...adminForm, serviceNo:e.target.value})} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}}/>
            <input placeholder="Rank / Department" value={adminForm.rank} onChange={e=>setAdminForm({...adminForm, rank:e.target.value})} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}}/>
            <button onClick={addMemberByAdmin} style={{width:'100%', padding:14, background:'#0b6e4f', color:'white', border:'none', borderRadius:8, fontWeight:'bold'}}>➕ ADD MEMBER NOW</button>
          </div>
          <div style={{marginTop:16, background:'white', padding:14, borderRadius:12}}>
            <h4>All Members Added by Admin ({contributions.length})</h4>
            {contributions.map((m,i)=><div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee', fontSize:12}}><span><b>{m.name}</b><br/>{m.serviceNo} - {m.rank}</span><span>{m.phone}</span></div>)}
          </div>
        </div>
      )}

      {view === 'requests' && (
        <div style={{padding:16, maxWidth:600, margin:'auto'}}>
          <button onClick={()=>setView('dashboard')}>← Back</button>
          <h3>Welfare Requests - Approve</h3>
          {requests.map((r,i)=><div key={i} style={{background:'white', padding:12, marginBottom:8, borderRadius:8, borderLeft: r.status==='Pending' ? '4px solid orange' : '4px solid green'}}>
            <b>{r.name}</b> - {r.phone}<br/><small>Service No: {r.serviceNo}</small><br/><span style={{fontSize:10, background:'#fff3cd', padding:'2px 6px', borderRadius:4}}>{r.status}</span>
           { r.status==='Pending' && isAdmin && <><button onClick={()=>approveRequest(r)} style={{marginLeft:10, background:'#0b6e4f', color:'white', border:'none', padding:'6px 10px', borderRadius:4, fontSize:11, cursor:'pointer'}}>APPROVE</button><button onClick={()=>rejectRequest(r)} style={{marginLeft:6, background:'#dc3545', color:'white', border:'none', padding:'6px 10px', borderRadius:4, fontSize:11, cursor:'pointer'}}>REJECT</button></>}
            {r.status==='Pending' && !isAdmin && <div style={{fontSize:11, color:'red', marginTop:4}}>Login as Admin to Approve</div>}
          </div>)}
        </div>
      )}

      {view === 'members' && (
        <div style={{padding:16, maxWidth:600, margin:'auto'}}>
          <button onClick={()=>setView('dashboard')}>← Back</button>
          <h3>👥 Members Directory</h3>
          {contributions.map((m,i)=><div key={i} style={{background:'white', padding:10, marginBottom:6, borderRadius:8, fontSize:13}}><b>{m.name}</b><br/>Service: {m.serviceNo} | Phone: {m.phone}</div>)}
        </div>
      )}

      {view === 'request' && (
        <div style={{padding:20, maxWidth:500, margin:'auto'}}>
          <button onClick={()=>setView('dashboard')}>← Back</button>
          <div style={{background:'white', padding:16, borderRadius:12, marginTop:10}}>
            <h3>Request Access</h3>
            <input placeholder="Full Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}}/>
            <input placeholder="Phone Number" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}}/>
            <input placeholder="Service Number" value={form.serviceNo} onChange={e=>setForm({...form, serviceNo:e.target.value})} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}}/>
            <button onClick={submitAccess} style={{width:'100%', padding:12, background:'#0b6e4f', color:'white', border:'none', borderRadius:8, fontWeight:'bold'}}>SUBMIT REQUEST</button>
          </div>
        </div>
      )}
    </div>
  )
}
export default App
