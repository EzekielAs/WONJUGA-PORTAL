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
    <div style={{minHeight:'100vh', background:'#f5f5f5'}}>
      <div style={{background:'#0d5c3a', color:'white', padding:12, display:'flex', justifyContent:'space-between'}}>
        <b>WONJUGA</b>
        <button onClick={()=>setMenu(!menu)}>☰ Menu</button>
      </div>

      {menu && (
        <div style={{background:'white', padding:12, width:260}}>
          {menuItems.map(([label,key])=>(
            <div key={key} onClick={()=>{setTab(key); setMenu(false)}} style={{padding:12, marginBottom:6, borderRadius:8, background: tab===key?'#0d5c3a':'#eee', color: tab===key?'white':'#333', cursor:'pointer'}}>{label}</div>
          ))}
          <button onClick={()=>{localStorage.removeItem('wonjuga_user'); location.reload()}} style={{width:'100%', marginTop:15, background:'red', color:'white', padding:10, border:'none', borderRadius:8}}>Logout</button>
        </div>
      )}

      <div style={{padding:20}}>
        {tab==='dashboard' && <h2>Welcome {user.fullName}</h2>}
        {tab==='profile' && <div>Profile: {user.fullName} - {user.idNumber}</div>}
        {tab==='admin_add' && isAdmin && <AdminMembers/>}
        {tab==='support' && <div>Welfare Support</div>}
        {tab==='claims' && <div>My Claims</div>}
        {tab==='contributions' && <div>Contributions</div>}
        {tab==='announcements' && <div>Announcements</div>}
        {tab==='notifications' && <div>Notifications</div>}
      </div>
    </div>
  )
}