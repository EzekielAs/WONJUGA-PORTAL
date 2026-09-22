import { useState } from 'react'
import AdminMembers from './AdminMembers'
import MemberJoin from './MemberJoin'

export default function App(){
  const storedUser = JSON.parse(localStorage.getItem('wonjuga_user') || 'null')
  if(!storedUser){ return <MemberJoin/> }

  const [tab,setTab]=useState('dashboard')
  const [menu,setMenu]=useState(false)
  const user = storedUser
  const isAdmin = user.idNumber?.toUpperCase() === 'GH/ADMIN' || user.fullName?.toLowerCase().includes('admin')

  const menuItems = [
    ['🏠 Dashboard','dashboard'],
    ['👤 My Profile','profile'],
    ...(isAdmin ? [['👑 Admin - Add Members','admin_add']] : []),
    ['🤝 Welfare Support','support'],
    ['📝 My Claims','claims'],
    ['💰 Contributions','contributions'],
    ['📢 Announcements','announcements'],
    ['🔔 Notifications','notifications'],
  ]

  return (
    <div style={{minHeight:'100vh', background:'#f5f7f8', fontFamily:'system-ui'}}>
      <div style={{background:'#0d5c3a', color:'white', padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:20}}>
        <b style={{fontSize:18}}>WONJUGA PORTAL</b>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <span style={{fontSize:13}}>{user.fullName}</span>
          <button onClick={()=>setMenu(!menu)} style={{background:'white', color:'#0d5c3a', border:'none', padding:'6px 12px', borderRadius:6, fontWeight:700}}>☰ Menu</button>
        </div>
      </div>

      <div style={{display:'flex'}}>
        {menu && (
          <div style={{background:'white', padding:12, width:270, minHeight:'calc(100vh - 50px)', boxShadow:'2px 0 10px rgba(0,0,0,0.1)'}}>
            {menuItems.map(([label,key])=>(
              <div key={key} onClick={()=>{setTab(key); setMenu(false)}} style={{padding:'14px 12px', marginBottom:6, borderRadius:10, background: tab===key?'#0d5c3a':'#f2f2f2', color: tab===key?'white':'#222', cursor:'pointer', fontWeight:600, fontSize:14}}>
                {label}
              </div>
            ))}
            <button onClick={()=>{localStorage.removeItem('wonjuga_user'); location.reload()}} style={{width:'100%', marginTop:20, background:'#d32f2f', color:'white', padding:12, border:'none', borderRadius:8, fontWeight:700}}>Logout</button>
          </div>
        )}

        <div style={{flex:1, padding:24}}>
          {tab==='dashboard' && (
            <div>
              <h2>Welcome {user.fullName} 👋</h2>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginTop:20}}>
                <div style={{background:'white', padding:20, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}><h3 style={{color:'#0d5c3a'}}>Member ID</h3><p style={{fontSize:18, fontWeight:700}}>{user.idNumber}</p></div>
                <div style={{background:'white', padding:20, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}><h3 style={{color:'#0d5c3a'}}>Phone</h3><p style={{fontSize:18, fontWeight:700}}>{user.phone}</p></div>
                <div style={{background:'white', padding:20, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}><h3 style={{color:'#0d5c3a'}}>Status</h3><p style={{fontSize:18, fontWeight:700, color:'green'}}>Active Member</p></div>
              </div>
              <div style={{background:'white', padding:20, borderRadius:12, marginTop:20}}><h3>About WONJUGA</h3><p>Your welfare portal for support, claims, and contributions.</p></div>
            </div>
          )}
          {tab==='profile' && <div style={{background:'white', padding:20, borderRadius:12}}><h2>My Profile</h2><p><b>Name:</b> {user.fullName}</p><p><b>ID:</b> {user.idNumber}</p><p><b>Phone:</b> {user.phone}</p></div>}
          {tab==='admin_add' && isAdmin && <AdminMembers/>}
          {tab==='support' && <div style={{background:'white', padding:20, borderRadius:12}}><h2>Welfare Support</h2><p>Apply for welfare assistance here.</p></div>}
          {tab==='claims' && <div style={{background:'white', padding:20, borderRadius:12}}><h2>My Claims</h2><p>No claims yet.</p></div>}
          {tab==='contributions' && <div style={{background:'white', padding:20, borderRadius:12}}><h2>Contributions</h2><p>Track your monthly contributions.</p></div>}
          {tab==='announcements' && <div style={{background:'white', padding:20, borderRadius:12}}><h2>Announcements</h2><p>Latest news from WONJUGA.</p></div>}
          {tab==='notifications' && <div style={{background:'white', padding:20, borderRadius:12}}><h2>Notifications</h2><p>No new notifications.</p></div>}
        </div>
      </div>
    </div>
  )
}