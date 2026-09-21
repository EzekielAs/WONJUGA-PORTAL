import { useState, useRef } from 'react'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

export default function App() {
  const [staffId, setStaffId] = useState('')
  const [phone, setPhone] = useState('')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('wonjuga_user') || 'null'))
  const [error, setError] = useState('')
  const [tab, setTab] = useState('home')
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [profilePic, setProfilePic] = useState(localStorage.getItem('wonjuga_pic') || null)
  const fileInputRef = useRef(null)
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

  const handlePicUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePic(reader.result)
      localStorage.setItem('wonjuga_pic', reader.result)
    }
    reader.readAsDataURL(file)
  }

  if (!user) {
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4f2', fontFamily:'sans-serif'}}>
        <form onSubmit={handleLogin} style={{background:'white', padding:28, borderRadius:20, width:340, boxShadow:'0 10px 30px rgba(0,0,0,0.08)'}}>
          <div style={{textAlign:'center', marginBottom:20}}>
            <div style={{width:50, height:50, background:'#0d5c3a', borderRadius:12, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold', fontSize:20}}>W</div>
            <h1 style={{marginTop:12, fontWeight:800, fontSize:22}}>WONJUGA</h1>
            <p style={{fontSize:12, color:'#888'}}>Staff Welfare Portal</p>
          </div>
          <input style={{width:'100%', padding:13, margin:'8px 0', border:'1px solid #ddd', borderRadius:10}} placeholder="GH/ADMIN001" value={staffId} onChange={e=>setStaffId(e.target.value)} required />
          <input style={{width:'100%', padding:13, margin:'8px 0', border:'1px solid #ddd', borderRadius:10}} placeholder="0550000001" value={phone} onChange={e=>setPhone(e.target.value)} required />
          {error && <p style={{color:'red', fontSize:12, textAlign:'center'}}>{error}</p>}
          <button style={{width:'100%', background:'#0d5c3a', color:'white', padding:13, borderRadius:10, marginTop:12, fontWeight:700, border:'none'}}>Login</button>
        </form>
      </div>
    )
  }

  const completed = contributions.length
  const required = 6
  const displayCompleted = Math.min(completed, required)
  const percent = Math.min((completed / required) * 100, 100)
  const eligible = completed >= required

  return (
    <div style={{minHeight:'100vh', background:'#f8faf9', fontFamily:'sans-serif', display:'flex', justifyContent:'center'}}>
      <div style={{width:'100%', maxWidth:420, background:'#f8faf9', minHeight:'100vh', position:'relative', paddingBottom:80}}>
        
        <div style={{background:'white', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee'}}>
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            <div onClick={()=>fileInputRef.current.click()} style={{width:38, height:38, background: profilePic ? `url(${profilePic})` : '#0d5c3a', backgroundSize:'cover', backgroundPosition:'center', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold', fontSize:12, cursor:'pointer', border:'2px solid #0d5c3a'}}>
              {!profilePic && 'EA'}
            </div>
            <div><div style={{fontWeight:700, fontSize:13}}>Ezekiel Asomani</div><div style={{fontSize:10, color:'#777'}}>{user.idNumber} • Click pic to change</div></div>
          </div>
          <button onClick={()=>{localStorage.clear(); setUser(null)}} style={{background:'#fff1f1', color:'#ff3b30', border:'1px solid #ffd1d1', padding:'6px 12px', borderRadius:20, fontSize:11, fontWeight:700}}>Logout</button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePicUpload} style={{display:'none'}} />

        {tab === 'home' && (
        <div style={{padding:16}}>
          <p style={{fontSize:11, color:'#6b7280'}}>Complete your profile to access all welfare services.</p>
          <button onClick={()=>setShowProfileForm(true)} style={{width:'100%', background:'#0d5c3a', color:'white', padding:12, borderRadius:10, marginTop:8, fontWeight:700, border:'none', fontSize:13}}>Complete Profile</button>

          <div style={{marginTop:22}}>
            <p style={{fontSize:13, color:'#374151'}}>Good Evening, GH 👋</p>
            <h1 style={{fontSize:22, fontWeight:800, color:'#0d5c3a', margin:'4px 0'}}>My Welfare Journey</h1>
            <div style={{background:'#eef6ff', borderRadius:16, padding:18, marginTop:14, border:'1px solid #dbeafe'}}>
              <h3 style={{fontWeight:700, color:'#1e3a5f', fontSize:14, margin:0}}>♡ You're building your welfare foundation</h3>
              <p style={{fontSize:12, color:'#4b5563', marginTop:10}}>You have completed {displayCompleted} of {required} contributions.</p>
              <p style={{fontWeight:700, fontSize:12, marginTop:12}}>Current Welfare Points: {completed}</p>
              <div style={{background:'white', height:8, borderRadius:10, marginTop:12, overflow:'hidden'}}><div style={{background: eligible ? '#16a34a' : '#0d5c3a', width:`${percent}%`, height:'100%'}}></div></div>
              <div style={{display:'flex', justifyContent:'space-between', marginTop:6}}><p style={{fontSize:10, color:'#777'}}>{displayCompleted}/{required} completed</p><p style={{fontSize:10, color:'#0d5c3a', fontWeight:700}}>{Math.round(percent)}%</p></div>
              <button onClick={makeContribution} style={{width:'100%', background:'#0d5c3a', color:'white', padding:10, borderRadius:8, marginTop:12, border:'none', fontWeight:700, fontSize:12}}>+ Make Test Contribution</button>
            </div>

            <div style={{marginTop:14, background:'white', borderRadius:16, padding:16, border:'1px solid #eef2f7'}}>
              <h3 style={{fontWeight:700, fontSize:13, margin:0}}>Progress Summary</h3>
              <span style={{display:'inline-block', marginTop:10, background: eligible ? '#dcfce7' : '#dbeafe', color: eligible ? '#166534' : '#1d4ed8', fontSize:10, padding:'4px 10px', borderRadius:20, fontWeight:600}}>{eligible ? 'Eligible for Claims' : 'Building Foundation'}</span>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14}}>
                <div style={{background:'#f8fafc', padding:10, borderRadius:10}}><p style={{fontSize:9, color:'#888'}}>CONTRIBUTIONS</p><p style={{fontWeight:800, fontSize:16}}>{displayCompleted} / {required}</p></div>
                <div style={{background:'#f0fdf4', padding:10, borderRadius:10}}><p style={{fontSize:9, color:'#888'}}>POINTS</p><p style={{fontWeight:800, fontSize:16, color:'#0d5c3a'}}>{completed} pts</p></div>
              </div>
            </div>

            <div style={{marginTop:14, background:'white', borderRadius:16, padding:16, border:'1px solid #eef2f7'}}>
              <h3 style={{fontWeight:700, fontSize:13, margin:0}}>Contribution History</h3>
              {contributions.slice().reverse().map(c=>(
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
              <div style={{background:'#fef2f2', padding:16, borderRadius:12, marginTop:16, border:'1px solid #fecaca'}}><p style={{fontSize:13, fontWeight:700, color:'#dc2626'}}>Not Eligible Yet</p><p style={{fontSize:12, color:'#991b1b', marginTop:6}}>Complete {required} contributions. You have {displayCompleted}/{required}.</p></div>
            ) : (
              <div style={{background:'#f0fdf4', padding:16, borderRadius:12, marginTop:16, border:'1px solid #bbf7d0'}}><p style={{fontSize:13, fontWeight:700, color:'#166534'}}>Eligible! 🎉</p><button style={{width:'100%', background:'#0d5c3a', color:'white', padding:12, borderRadius:10, marginTop:12, border:'none', fontWeight:700}}>Request Welfare Support</button></div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div style={{padding:16}}>
            <h2 style={{fontWeight:800, fontSize:18, color:'#0d5c3a'}}>My Profile</h2>
            <div style={{background:'white', padding:20, borderRadius:16, marginTop:16, textAlign:'center', border:'1px solid #eef2f7'}}>
              <div onClick={()=>fileInputRef.current.click()} style={{width:90, height:90, borderRadius:'50%', margin:'0 auto', background: profilePic ? `url(${profilePic})` : '#e2e8f0', backgroundSize:'cover', backgroundPosition:'center', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:'#64748b', cursor:'pointer', border:'3px solid #0d5c3a'}}>
                {!profilePic && 'EA'}
              </div>
              <p style={{fontSize:12, color:'#0d5c3a', marginTop:8, fontWeight:700, cursor:'pointer'}} onClick={()=>fileInputRef.current.click()}>📷 Click to upload/change picture</p>
              {profilePic && <button onClick={()=>{setProfilePic(null); localStorage.removeItem('wonjuga_pic')}} style={{marginTop:8, fontSize:11, color:'#ff3b30', background:'none', border:'none'}}>Remove picture</button>}
              <div style={{textAlign:'left', marginTop:20}}>
                <p style={{fontSize:13, marginTop:10}}><b>Name:</b> Ezekiel Asomani</p>
                <p style={{fontSize:13, marginTop:10}}><b>Staff ID:</b> {user.idNumber}</p>
                <p style={{fontSize:13, marginTop:10}}><b>Phone:</b> 0550000001</p>
                <p style={{fontSize:13, marginTop:10}}><b>Status:</b> Active Member ✅</p>
                <button onClick={()=>setShowProfileForm(true)} style={{width:'100%', background:'white', border:'1px solid #0d5c3a', color:'#0d5c3a', padding:12, borderRadius:10, marginTop:20, fontWeight:700}}>Edit Profile</button>
              </div>
            </div>
            <p style={{fontSize:10, color:'#999', textAlign:'center', marginTop:12}}>Picture saved locally for test. For real app, we will save to server.</p>
          </div>
        )}

        {showProfileForm && (
          <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16}}>
            <div style={{background:'white', padding:20, borderRadius:16, width:'100%', maxWidth:360}}>
              <h3 style={{fontWeight:700}}>Complete Profile</h3>
              <div onClick={()=>fileInputRef.current.click()} style={{width:70, height:70, borderRadius:'50%', margin:'10px auto', background: profilePic ? `url(${profilePic})` : '#e2e8f0', backgroundSize:'cover', backgroundPosition:'center', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}> {!profilePic && '📷'}</div>
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
          <span onClick={()=>setTab('claims')} style={{fontSize:12, fontWeight: tab==='claims'?700:400, color: tab==='claims'?'#0d5c3a':'#aaa', cursor:'pointer'}}>◈ Claims</span>
          <span onClick={()=>setTab('profile')} style={{fontSize:12, fontWeight: tab==='profile'?700:400, color: tab==='profile'?'#0d5c3a':'#aaa', cursor:'pointer'}}>👤 Profile</span>
        </div>
      </div>
    </div>
  )
}