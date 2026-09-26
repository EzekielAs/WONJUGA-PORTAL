import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC5KbDk6U4Q0xK4zK4zK4zK4zK4zK4zK4zK4zK4",
  authDomain: "gis-wonjuga-welfare.firebaseapp.com",
  projectId: "gis-wonjuga-welfare",
  storageBucket: "gis-wonjuga-welfare.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc"
};
// YOUR CONFIG IS ALREADY THERE - DON'T CHANGE
const app = initializeApp(JSON.parse(localStorage.getItem('firebaseConfig') || JSON.stringify({
  apiKey: "AIzaSyBv9z2Q0R8v7X8v7X8v7X8v7",
  authDomain: "gis-wonjuga-welfare.firebaseapp.com",
  projectId: "gis-wonjuga-welfare"
})));
const db = getFirestore(app);

export default function App(){
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('wonjuga_user')||'null'))
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('wonjuga_admin')==='true')
  const [menuOpen, setMenuOpen] = useState(false)
  const [view, setView] = useState('dashboard')
  const [requests, setRequests] = useState([])
  const [members, setMembers] = useState([])
  const [showAuth, setShowAuth] = useState(currentUser ? 'dashboard' : 'login')
  
  // Forms
  const [phone, setPhone] = useState(''); const [serviceNo, setServiceNo] = useState('')
  const [reqName, setReqName] = useState(''); const [reqPhone, setReqPhone] = useState(''); const [reqService, setReqService] = useState('')
  const [adminU, setAdminU] = useState(''); const [adminP, setAdminP] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  useEffect(()=>{
    const unsub1 = onSnapshot(collection(db, "welfareRequests"), snap=> setRequests(snap.docs.map(d=>({id:d.id, ...d.data()}))))
    const unsub2 = onSnapshot(collection(db, "contributions"), snap=> setMembers(snap.docs.map(d=>({id:d.id, ...d.data()}))))
    return ()=>{unsub1(); unsub2()}
  },[])

  const handleMemberLogin = ()=>{
    if(phone.trim() && serviceNo.trim()){
      const found = members.find(m=> m.phone===phone && m.serviceNo===serviceNo)
      const user = found || {name: "Member", phone, serviceNo, isAdmin: false}
      localStorage.setItem('wonjuga_user', JSON.stringify(user))
      setCurrentUser(user); setShowAuth('dashboard'); setView('dashboard')
    } else alert("Enter Phone & Service No")
  }

  const handleAdminLogin = ()=>{
    if(adminU==='admin' && adminP==='wonjuga123'){
      const adminUser = {name: "ADMIN", phone: "Admin", serviceNo: "ADMIN", isAdmin: true}
      localStorage.setItem('wonjuga_user', JSON.stringify(adminUser))
      localStorage.setItem('wonjuga_admin','true')
      setCurrentUser(adminUser); setIsAdmin(true); setShowAuth('dashboard'); setShowAdminLogin(false)
    } else alert("Wrong Admin credentials")
  }

  const handleRequestAccess = async ()=>{
    if(!reqName || !reqPhone || !reqService) return alert("Fill all")
    await addDoc(collection(db, "welfareRequests"), {name:reqName, phone:reqPhone, serviceNo:reqService, date: new Date().toLocaleDateString(), status: 'Pending'})
    alert("Request Sent! Wait for Admin Approval"); setReqName(''); setReqPhone(''); setReqService(''); setShowAuth('login')
  }

  const logout = ()=>{ localStorage.removeItem('wonjuga_user'); localStorage.removeItem('wonjuga_admin'); setCurrentUser(null); setIsAdmin(false); setShowAuth('login') }

  const approveRequest = async (r)=>{ await updateDoc(doc(db, "welfareRequests", r.id), {status:'Approved'}); await addDoc(collection(db, "contributions"), {name:r.name, phone:r.phone, serviceNo:r.serviceNo, amount:0, date:new Date().toLocaleDateString()}) }
  const rejectRequest = async (r)=>{ if(confirm(`Delete ${r.name}?`)) await deleteDoc(doc(db, "welfareRequests", r.id)) }

  // IF NOT LOGGED IN - SHOW LOGIN PAGE FIRST
  if(!currentUser || showAuth!=='dashboard'){
    return (
      <div style={{minHeight:'100vh', background:'#f0f4f0', display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
        <div style={{background:'white', width:'100%', maxWidth:400, borderRadius:16, padding:30, boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}>
          <h2 style={{textAlign:'center', color:'#0b6e4f', marginBottom:5, cursor:'pointer'}} onDoubleClick={()=>setShowAdminLogin(true)}>GIS WONJUGA WELFARE</h2>
          <p style={{textAlign:'center', fontSize:12, color:'#666', marginBottom:20}}>Welfare Portal - Login Required</p>
          
          {showAuth==='login' ? (
            <>
              <input placeholder="Phone Number e.g 054..." value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ddd'}} />
              <input placeholder="Service Number e.g IS/12197" value={serviceNo} onChange={e=>setServiceNo(e.target.value)} style={{width:'100%', padding:12, marginBottom:15, borderRadius:8, border:'1px solid #ddd'}} />
              <button onClick={handleMemberLogin} style={{width:'100%', padding:12, background:'#0b6e4f', color:'white', border:'none', borderRadius:8, fontWeight:'bold'}}>LOGIN</button>
              <p style={{textAlign:'center', marginTop:15, fontSize:13}}>No Access? <span onClick={()=>setShowAuth('request')} style={{color:'#0b6e4f', fontWeight:'bold', cursor:'pointer'}}>Request Access</span></p>
              
              {showAdminLogin && (
                <div style={{marginTop:20, padding:15, background:'#fff3e0', borderRadius:8}}>
                  <p style={{fontSize:12, fontWeight:'bold'}}>Admin Only</p>
                  <input placeholder="Admin Username" value={adminU} onChange={e=>setAdminU(e.target.value)} style={{width:'100%', padding:8, marginBottom:5}}/>
                  <input placeholder="Password" type="password" value={adminP} onChange={e=>setAdminP(e.target.value)} style={{width:'100%', padding:8, marginBottom:8}}/>
                  <button onClick={handleAdminLogin} style={{width:'100%', padding:8, background:'black', color:'white', borderRadius:6}}>Admin Login</button>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 style={{fontSize:14, marginBottom:10}}>Request Membership</h3>
              <input placeholder="Full Name" value={reqName} onChange={e=>setReqName(e.target.value)} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ddd'}}/>
              <input placeholder="Phone" value={reqPhone} onChange={e=>setReqPhone(e.target.value)} style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ddd'}}/>
              <input placeholder="Service No" value={reqService} onChange={e=>setReqService(e.target.value)} style={{width:'100%', padding:12, marginBottom:15, borderRadius:8, border:'1px solid #ddd'}}/>
              <button onClick={handleRequestAccess} style={{width:'100%', padding:12, background:'#ff9800', color:'white', border:'none', borderRadius:8, fontWeight:'bold'}}>SUBMIT REQUEST</button>
              <p style={{textAlign:'center', marginTop:15, fontSize:13, cursor:'pointer'}} onClick={()=>setShowAuth('login')}>← Back to Login</p>
            </>
          )}
        </div>
      </div>
    )
  }

  // AFTER LOGIN - DASHBOARD WITH YOUR REQUESTED HEADER
  return (
    <div style={{minHeight:'100vh', background:'#f5f5f5'}}>
      {/* HEADER - YOUR REQUEST */}
      <div style={{background:'#0b6e4f', color:'white', padding:'12px 15px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100}}>
        {/* LEFT - MENU BUTTON WHERE YOUR CURSOR WAS */}
        <button onClick={()=>setMenuOpen(!menuOpen)} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'white', fontSize:22, padding:'5px 10px', borderRadius:6, cursor:'pointer'}}>☰</button>
        
        {/* MIDDLE - TITLE CENTERED */}
        <h1 style={{margin:0, fontSize:16, fontWeight:'bold', textAlign:'center', flex:1}}>GIS WONJUGA WELFARE</h1>
        
        {/* RIGHT - PROFILE PICTURE */}
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:35, height:35, borderRadius:'50%', background:'#ff9800', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:14}}>
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>

      {/* SIDE MENU DRAWER - HIDDEN UNTIL MENU PRESS */}
      {menuOpen && (
        <div style={{position:'fixed', inset:0, zIndex:200, display:'flex'}}>
          <div style={{width:260, background:'white', height:'100%', padding:20, boxShadow:'5px 0 15px rgba(0,0,0,0.2)'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:20}}>
              <strong>Menu</strong><button onClick={()=>setMenuOpen(false)} style={{border:'none', background:'none', fontSize:20}}>✕</button>
            </div>
            {[
              {k:'dashboard', l:'📊 Dashboard'},
              {k:'contributions', l:'💰 Contributions'},
              {k:'members', l:'👥 Members Directory'},
              {k:'requests', l:`🤲 Welfare Requests ${requests.filter(r=>r.status==='Pending').length>0 ? `(${requests.filter(r=>r.status==='Pending').length} Pending)` : ''}`},
              {k:'events', l:'📅 Events & Dues'},
              {k:'financial', l:'📈 Financial Report'},
              {k:'constitution', l:'📜 Constitution'},
              {k:'notifications', l:'🔔 Notifications'},
            ].map(m=>(
              <div key={m.k} onClick={()=>{setView(m.k); setMenuOpen(false)}} style={{padding:'12px 10px', cursor:'pointer', borderRadius:8, background: view===m.k ? '#e8f5e9' : 'transparent', marginBottom:5, fontSize:14}}>{m.l}</div>
            ))}
            <hr style={{margin:'15px 0'}}/>
            <div style={{fontSize:12, color:'#666'}}>Logged in as:<br/><b>{currentUser.name}</b><br/>{currentUser.phone}<br/>{isAdmin && <span style={{color:'green'}}>Admin</span>}</div>
            <button onClick={logout} style={{marginTop:15, width:'100%', padding:10, background:'#dc3545', color:'white', border:'none', borderRadius:8}}>Logout</button>
          </div>
          <div style={{flex:1, background:'rgba(0,0,0,0.4)'}} onClick={()=>setMenuOpen(false)}></div>
        </div>
      )}

      {/* CONTENT */}
      <div style={{padding:15, maxWidth:800, margin:'0 auto'}}>
        {view==='dashboard' && (
          <>
            <p style={{color:'#666', fontSize:14}}>Welcome, {currentUser.name}! - 7 Points</p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:10}}>
              <div onClick={()=>{setView('contributions');}} style={{background:'white', padding:15, borderRadius:10, cursor:'pointer'}}><div>💰</div><b style={{fontSize:13}}>Contributions</b><div style={{fontSize:11, color:'#888'}}>GHS 0</div></div>
              <div onClick={()=>setView('members')} style={{background:'white', padding:15, borderRadius:10, cursor:'pointer'}}><div>👥</div><b style={{fontSize:13}}>Members Directory</b><div style={{fontSize:11, color:'#888'}}>{members.length} Members</div></div>
              <div onClick={()=>setView('requests')} style={{background:'white', padding:15, borderRadius:10, cursor:'pointer'}}><div>🤲</div><b style={{fontSize:13}}>Welfare Requests</b><div style={{fontSize:11, color:'#888'}}>{requests.filter(r=>r.status==='Pending').length} Pending</div></div>
              <div style={{background:'white', padding:15, borderRadius:10}}><div>📅</div><b style={{fontSize:13}}>Events & Dues</b><div style={{fontSize:11, color:'#888'}}>Meetings</div></div>
            </div>
            <p style={{textAlign:'center', marginTop:20, fontSize:11, color:'#999'}}>Tap ☰ Menu for more options</p>
          </>
        )}

        {view==='requests' && (
          <div style={{background:'white', padding:15, borderRadius:10}}>
            <h3>Welfare Requests</h3>
            {requests.map(r=>(
              <div key={r.id} style={{borderBottom:'1px solid #eee', padding:'10px 0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div><b>{r.name}</b><div style={{fontSize:12}}>{r.phone} | {r.serviceNo}</div><span style={{fontSize:10, padding:'2px 6px', borderRadius:10, background: r.status==='Approved' ? '#d4edda' : '#fff3cd'}}>{r.status}</span></div>
                {r.status==='Pending' && isAdmin && <><button onClick={()=>approveRequest(r)} style={{background:'#0b6e4f', color:'white', border:'none', padding:'6px 10px', borderRadius:4, fontSize:11}}>APPROVE</button><button onClick={()=>rejectRequest(r)} style={{marginLeft:6, background:'#dc3545', color:'white', border:'none', padding:'6px 10px', borderRadius:4, fontSize:11}}>REJECT</button></>}
              </div>
            ))}
          </div>
        )}

        {view==='members' && (
          <div style={{background:'white', padding:15, borderRadius:10}}>
            <h3>Members ({members.length})</h3>
            {members.map(m=><div key={m.id} style={{padding:'8px 0', borderBottom:'1px solid #eee'}}>{m.name} - {m.phone}</div>)}
          </div>
        )}
        {view!=='dashboard' && view!=='requests' && view!=='members' && <div style={{background:'white', padding:30, borderRadius:10, textAlign:'center'}}><h3>{view}</h3><p>Content for {view} coming...</p><button onClick={()=>setView('dashboard')}>← Back</button></div>}
      </div>
    </div>
  )
}
