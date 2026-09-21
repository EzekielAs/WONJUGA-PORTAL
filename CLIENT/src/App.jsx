import { useState } from 'react'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

export default function App() {
  const [staffId, setStaffId] = useState('')
  const [phone, setPhone] = useState('')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('wonjuga_user') || 'null'))
  const [error, setError] = useState('')
  const [tab, setTab] = useState('home')
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [contributions, setContributions] = useState([
    { id: 1, date: '2026-07-15', amount: 'GHS 50', status: 'Success' },
    { id: 2, date: '2026-08-15', amount: 'GHS 50', status: 'Success' },
  ])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API_URL}/login`, { idNumber: staffId, phone })
      localStorage.setItem('wonjuga_user', JSON.stringify(res.data.user))
      setUser(res.data.user)
    } catch { setError('Wrong ID or Phone') }
  }

  const makeContribution = () => {
    const newC = { id: contributions.length + 1, date: new Date().toISOString().slice(0,10), amount: 'GHS 50', status: 'Success' }
    setContributions([...contributions, newC])
  }

  if (!user) {
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4f2', fontFamily:'sans-serif'}}>
        <form onSubmit={handleLogin} style={{background:'white', padding:28, borderRadius:20, width:340, boxShadow:'0 10px 30px rgba(0,0,0,0.08)'}}>
          <div style={{textAlign:'center', marginBottom:20}}>
            <div style={{width:50, height:50, background:'#0d5c3a', borderRadius:12, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold', fontSize:20}}>W</div>
            <h1 style={{marginTop:12, fontWeight:800, fontSize:22}}>WONJUGA</h1>
            <p style={{fontSize:12, color:'#888'}}>Staff Welfare Portal - Test Mode</p>
          </div>
          <input style={{width:'100%', padding:13, margin:'8px 0', border:'1px solid #ddd', borderRadius:10}} placeholder="GH/ADMIN001" value={staffId} onChange={e=>setStaffId(e.target.value)} required />
          <input style={{width:'100%', padding:13, margin:'8px 0', border:'1px solid #ddd', borderRadius:10}} placeholder="0550000001" value={phone} onChange={e=>setPhone(e.target.value)} required />
          {error && <p style={{color:'red', fontSize:12, textAlign:'center'}}>{error}</p>}
          <button style={{width:'100%', background:'#0d5c3a', color:'white', padding:13, borderRadius:10, marginTop:12, fontWeight:700, border:'none'}}>Login</button>
          <p style={{fontSize:10, color:'#999', textAlign:'center', marginTop:10}}>Use GH/ADMIN001 / 0550000001 for test</p>
        </form>
      </div>
    )
  }

  const completed = contributions.length
  const required = 6
  const points = completed
  const percent = Math.min((completed / required) * 100, 100)
  const eligible = completed >= required

  return (
    <div style={{minHeight:'100vh', background:'#f8faf9', fontFamily:'sans-serif', display:'flex', justifyContent:'center'}}>
      <div style={{width:'100%', maxWidth:420, background:'#f8faf9', minHeight:'100vh', position:'relative', paddingBottom:80}}>
        
        <div style={{background:'white', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee'}}>
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            <div style={{width:38, height:38, background:'#0d5c3a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold', fontSize:12}}>EA</div>
            <div><div style={{fontWeight:700, fontSize:13}}>Ezekiel Asomani</div><div style={{fontSize:10, color:'#777'}}>{user.idNumber}</div></div>
          </div>
          <button onClick={()=>{localStorage.clear(); setUser(null)}} style={{background:'#fff1f1', color:'#ff3b30', border:'1px solid #ffd1d1', padding:'6px 12px', borderRadius:20, fontSize:11, fontWeight:700}}>Logout</button>
        </div>

        {tab === 'home' && (
        <div style={{padding:16}}>
          <p style={{fontSize:11, color:'#6b7280'}}>Complete your profile to access all welfare services.</p>
          <button onClick={()=>setShowProfileForm(true)} style={{width:'100%', background:'#0d5c3a', color:'white', padding:12, borderRadius:10, marginTop:8, fontWeight:700, border:'none', fontSize:13}}>Complete Profile</button>

          <div style={{marginTop:22}}>
            <p style={{fontSize:13, color:'#374151'}}>Good Evening, GH 👋</p>
            <h1 style={{fontSize:22, fontWeight:800, color:'#0d5c3a', margin:'4px 0'}}>My Welfare Journey</h1>

            <div style={{background:'#eef6ff', borderRadius:16, padding:18, marginTop:14, border:'1px solid #dbeafe'}}>
              <h3 style={{fontWeight:700, color:'#1e3a5f', fontSize:14, margin:0}}>♡ You're building your welfare foundation</h3>
              <p style={{fontSize:12, color:'#4b5563', marginTop:10}}>You have completed {completed} of {required} contributions.</p>
              <p style={{fontSize:12, color:'#4b5563'}}>{eligible ? 'You are now eligible for welfare claims!' : `Only ${required - completed} more to become eligible.`}</p>
              <p style={{fontWeight:700, fontSize:12, marginTop:12}}>Current Welfare Points: {points}</p>
              <div style={{background:'white', height:8, borderRadius:10, marginTop:12, overflow:'hidden'}}><div style={{background: eligible ? '#16a34a' : '#0d5c3a', width:`${percent}%`, height:'100%'}}></div></div>
              <div style={{display:'flex', justifyContent:'space-between', marginTop:6}}><p style={{fontSize:10, color:'#777'}}>{completed}/{required} completed</p><p style={{fontSize:10, color:'#0d5c3a', fontWeight:700}}>{Math.round(percent)}%</p></div>
              <button onClick={makeContribution} style={{width:'100%', background:'#0d5c3a', color:'white', padding:10, borderRadius:8, marginTop:12, border:'none', fontWeight:700, fontSize:12}}>+ Make Test Contribution (For Demo)</button>
            </div>

            <div style={{marginTop:14, background:'white', borderRadius:16, padding:16, border:'1px solid #eef2f7'}}>
              <h3 style={{fontWeight:700, fontSize:13, margin:0}}>Progress Summary</h3>
              <p style={{fontSize:11, color:'#9ca3af', marginTop:4}}>Membership position</p>
              <span style={{display:'inline-block', marginTop:10, background: eligible ? '#dcfce7' : '#dbeafe', color: eligible ? '#166534' : '#1d4ed8', fontSize:10, padding:'4px 10px', borderRadius:20, fontWeight:600}}>{eligible ? 'Eligible for Claims' : 'Building Foundation'}</span>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14}}>
                <div style={{background:'#f8fafc', padding:10, borderRadius:10}}><p style={{fontSize:9, color:'#888'}}>CONTRIBUTIONS</p><p style={{fontWeight:800, fontSize:16}}>{completed} / {required}</p></div>
                <div style={{background:'#f0fdf4', padding:10, borderRadius:10}}><p style={{fontSize:9, color:'#888'}}>POINTS</p><p style={{fontWeight:800, fontSize:16, color:'#0d5c3a'}}>{points} pts</p></div>
              </div>
            </div>

            <div style={{marginTop:14, background:'white', borderRadius:16, padding:16, border:'1px solid #eef2f7'}}>
              <h3 style={{fontWeight:700, fontSize:13, margin:0}}>Contribution History</h3>
              {contributions.map(c=>(
                <div key={c.id} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f1f5f9', fontSize:12}}>
                  <span>{c.date}</span><span>{c.amount}</span><span style={{color:'#16a34a', fontWeight:700}}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {tab === 'claims' && (
          <div style={{padding:16}}>
            <h2 style={{fontWeight:800, fontSize:18, color:'#0d5c3a'}}>Welfare Claims</h2>
            {!eligible ? (
              <div style={{background:'#fef2f2', padding:16, borderRadius:12, marginTop:16, border:'1px solid #fecaca'}}>
                <p style={{fontSize:13, fontWeight:700, color:'#dc2626'}}>Not Eligible Yet</p>
                <p style={{fontSize:12, color:'#991b1b', marginTop:6}}>Complete {required} contributions to unlock claims. You have {completed}/{required}.</p>
              </div>
            ) : (
              <div style={{background:'#f0fdf4', padding:16, borderRadius:12, marginTop:16, border:'1px solid #bbf7d0'}}>
                <p style={{fontSize:13, fontWeight:700, color:'#166534'}}>Eligible! 🎉</p>
                <button style={{width:'100%', background:'#0d5c3a', color:'white', padding:12, borderRadius:10, marginTop:12, border:'none', fontWeight:700}}>Request Welfare Support</button>
              </div>
            )}
            <div style={{background:'white', padding:16, borderRadius:12, marginTop:16}}>
              <p style={{fontSize:12, fontWeight:700}}>Past Claims</p>
              <p style={{fontSize:11, color:'#999', marginTop:8}}>No claims yet.</p>
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div style={{padding:16}}>
            <h2 style={{fontWeight:800, fontSize:18, color:'#0d5c3a'}}>My Profile</h2>
            <div style={{background:'white', padding:16, borderRadius:12, marginTop:16}}>
              <p style={{fontSize:12}}><b>Name:</b> Ezekiel Asomani</p>
              <p style={{fontSize:12, marginTop:8}}><b>Staff ID:</b> {user.idNumber}</p>
              <p style={{fontSize:12, marginTop:8}}><b>Phone:</b> {user.phone || '0550000001'}</p>
              <p style={{fontSize:12, marginTop:8}}><b>Status:</b> Active Member</p>
              <button onClick={()=>setShowProfileForm(true)} style={{width:'100%', background:'white', border:'1px solid #0d5c3a', color:'#0d5c3a', padding:10, borderRadius:8, marginTop:16, fontWeight:700}}>Edit Profile</button>
            </div>
          </div>
        )}

        {showProfileForm && (
          <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16}}>
            <div style={{background:'white', padding:20, borderRadius:16, width:'100%', maxWidth:360}}>
              <h3 style={{fontWeight:700}}>Complete Profile</h3>
              <input placeholder="Full Name" defaultValue="Ezekiel Asomani" style={{width:'100%', padding:10, marginTop:10, border:'1px solid #ddd', borderRadius:8}} />
              <input placeholder="Department" style={{width:'100%', padding:10, marginTop:10, border:'1px solid #ddd', borderRadius:8}} />
              <input placeholder="Rank" style={{width:'100%', padding:10, marginTop:10, border:'1px solid #ddd', borderRadius:8}} />
              <div style={{display:'flex', gap:10, marginTop:16}}>
                <button onClick={()=>setShowProfileForm(false)} style={{flex:1, padding:10, borderRadius:8, border:'1px solid #ddd', background:'white'}}>Cancel</button>
                <button onClick={()=>setShowProfileForm(false)} style={{flex:1, padding:10, borderRadius:8, border:'none', background:'#0d5c3a', color:'white', fontWeight:700}}>Save</button>
              </div>
            </div>
          </div>
        )}

        <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:420, background:'white', borderTop:'1px solid #eee', display:'flex', justifyContent:'space-around', padding:'12px 0'}}>
          <span onClick={()=>setTab('home')} style={{fontSize:12, fontWeight: tab==='home'?700:400, color: tab==='home'?'#0d5c3a':'#aaa', cursor:'pointer'}}>⌂ Home</span>
          <span onClick={()=>setTab('claims')} style={{fontSize:12, fontWeight: tab==='claims'?700:400, color: tab==='claims'?'#0d5c3a':'#aaa', cursor:'pointer'}}>◈ Claims {eligible && <span style={{background:'#16a34a', color:'white', fontSize:8, padding:'2px 5px', borderRadius:10}}>!</span>}</span>
          <span onClick={()=>setTab('profile')} style={{fontSize:12, fontWeight: tab==='profile'?700:400, color: tab==='profile'?'#0d5c3a':'#aaa', cursor:'pointer'}}>👤 Profile</span>
        </div>
      </div>
    </div>
  )
}