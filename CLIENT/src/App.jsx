import { useState } from 'react'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

export default function App() {
  const [staffId, setStaffId] = useState('')
  const [phone, setPhone] = useState('')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('wonjuga_user') || 'null'))
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post(`${API_URL}/login`, { idNumber: staffId, phone })
      localStorage.setItem('wonjuga_user', JSON.stringify(res.data.user))
      setUser(res.data.user)
    } catch (err) { setError('Wrong ID or Phone') }
  }

  if (!user) {
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4f2', fontFamily:'sans-serif'}}>
        <form onSubmit={handleLogin} style={{background:'white', padding:28, borderRadius:20, width:340, boxShadow:'0 10px 30px rgba(0,0,0,0.08)'}}>
          <div style={{textAlign:'center', marginBottom:20}}>
            <div style={{width:50, height:50, background:'#0d5c3a', borderRadius:12, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold'}}>W</div>
            <h1 style={{marginTop:12, fontWeight:800, fontSize:22}}>WONJUGA</h1>
            <p style={{fontSize:12, color:'#888'}}>Staff Welfare Portal</p>
          </div>
          <input style={{width:'100%', padding:13, margin:'8px 0', border:'1px solid #ddd', borderRadius:10, outline:'none'}} placeholder="Staff ID: GH/ADMIN001" value={staffId} onChange={e=>setStaffId(e.target.value)} required />
          <input style={{width:'100%', padding:13, margin:'8px 0', border:'1px solid #ddd', borderRadius:10, outline:'none'}} placeholder="Phone: 0550000001" value={phone} onChange={e=>setPhone(e.target.value)} required />
          {error && <p style={{color:'#e11', fontSize:12, textAlign:'center'}}>{error}</p>}
          <button style={{width:'100%', background:'#0d5c3a', color:'white', padding:13, borderRadius:10, marginTop:12, fontWeight:700, border:'none'}}>Login</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh', background:'#f8faf9', fontFamily:'sans-serif', display:'flex', justifyContent:'center'}}>
      <div style={{width:'100%', maxWidth:420, background:'#f8faf9', minHeight:'100vh', position:'relative', paddingBottom:80}}>
        
        {/* Header */}
        <div style={{background:'white', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee'}}>
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            <div style={{width:38, height:38, background:'#e2e8f0', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>EA</div>
            <div>
              <div style={{fontWeight:700, fontSize:13}}>Ezekiel Asomani</div>
              <div style={{fontSize:10, color:'#777'}}>{user.idNumber} • Welfare Member</div>
            </div>
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <div style={{width:32, height:32, background:'#f1f5f9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>🔔</div>
            <button onClick={()=>{localStorage.clear(); setUser(null)}} style={{background:'#fff1f1', color:'#ff3b30', border:'1px solid #ffd1d1', padding:'6px 12px', borderRadius:20, fontSize:11, fontWeight:700}}>Logout</button>
          </div>
        </div>

        <div style={{padding:16}}>
          <p style={{fontSize:11, color:'#6b7280'}}>Complete your profile to access all welfare services.</p>
          <button style={{width:'100%', background:'#0d5c3a', color:'white', padding:12, borderRadius:10, marginTop:8, fontWeight:700, border:'none', fontSize:13}}>Complete Profile</button>

          <div style={{marginTop:22}}>
            <p style={{fontSize:13, color:'#374151'}}>Good Evening, GH 👋</p>
            <h1 style={{fontSize:22, fontWeight:800, color:'#0d5c3a', margin:'4px 0'}}>My Welfare Journey</h1>
            <p style={{fontSize:11, color:'#9ca3af', lineHeight:1.4}}>Welcome back.<br/>Here's your Welfare Journey.</p>

            <div style={{background:'#eef6ff', borderRadius:16, padding:18, marginTop:14, border:'1px solid #dbeafe'}}>
              <div style={{display:'flex', gap:8}}>
                <span>♡</span>
                <h3 style={{fontWeight:700, color:'#1e3a5f', fontSize:14, margin:0}}>You're building your welfare foundation</h3>
              </div>
              <p style={{fontSize:12, color:'#4b5563', marginTop:10, lineHeight:1.5}}>You have successfully completed 2 of the required 6 contributions.</p>
              <p style={{fontSize:12, color:'#4b5563', marginTop:4, lineHeight:1.5}}>Only 4 more successful contributions to become eligible for welfare claims.</p>
              <p style={{fontWeight:700, fontSize:12, marginTop:12}}>Current Welfare Points: 2</p>
              <div style={{background:'white', height:8, borderRadius:10, marginTop:12, overflow:'hidden'}}>
                <div style={{background:'#0d5c3a', width:'33%', height:'100%', borderRadius:10}}></div>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginTop:6}}>
                <p style={{fontSize:10, color:'#777'}}>2/6 completed</p>
                <p style={{fontSize:10, color:'#0d5c3a', fontWeight:700}}>33%</p>
              </div>
            </div>

            <div style={{marginTop:14, background:'white', borderRadius:16, padding:16, border:'1px solid #eef2f7'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <h3 style={{fontWeight:700, fontSize:13, margin:0}}>Progress Summary</h3>
                <span style={{fontSize:10, color:'#0d5c3a'}}>View all →</span>
              </div>
              <p style={{fontSize:11, color:'#9ca3af', marginTop:2}}>Your membership position from the Progressive Engine.</p>
              <div style={{marginTop:14}}>
                <p style={{fontSize:9, color:'#9ca3af', letterSpacing:1}}>MEMBERSHIP STATUS</p>
                <span style={{display:'inline-block', marginTop:6, background:'#dbeafe', color:'#1d4ed8', fontSize:10, padding:'4px 10px', borderRadius:20, fontWeight:600}}>Building Foundation</span>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14}}>
                <div style={{background:'#f8fafc', padding:10, borderRadius:10}}><p style={{fontSize:9, color:'#888'}}>CONTRIBUTIONS</p><p style={{fontWeight:800, fontSize:16, margin:'2px 0'}}>2 / 6</p></div>
                <div style={{background:'#f0fdf4', padding:10, borderRadius:10}}><p style={{fontSize:9, color:'#888'}}>POINTS</p><p style={{fontWeight:800, fontSize:16, margin:'2px 0', color:'#0d5c3a'}}>2 pts</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:420, background:'white', borderTop:'1px solid #eee', display:'flex', justifyContent:'space-around', padding:'10px 0'}}>
          <span style={{fontSize:11, fontWeight:700, color:'#0d5c3a'}}>⌂ Home</span>
          <span style={{fontSize:11, color:'#aaa'}}>◈ Claims</span>
          <span style={{fontSize:11, color:'#aaa'}}>👤 Profile</span>
        </div>
      </div>
    </div>
  )
}