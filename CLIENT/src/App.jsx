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
    try {
      const res = await axios.post(`${API_URL}/login`, { idNumber: staffId, phone })
      localStorage.setItem('wonjuga_user', JSON.stringify(res.data.user))
      setUser(res.data.user)
    } catch (err) {
      setError('Login failed')
    }
  }

  if (!user) {
    return (
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f5'}}>
        <form onSubmit={handleLogin} style={{background:'white', padding:30, borderRadius:16, width:320, boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
          <h1 style={{fontWeight:'bold', textAlign:'center'}}>WONJUGA Login</h1>
          <input style={{width:'100%', padding:12, margin:'10px 0', border:'1px solid #ccc', borderRadius:8}} placeholder="GH/ADMIN001" value={staffId} onChange={e=>setStaffId(e.target.value)} />
          <input style={{width:'100%', padding:12, margin:'10px 0', border:'1px solid #ccc', borderRadius:8}} placeholder="0550000001" value={phone} onChange={e=>setPhone(e.target.value)} />
          {error && <p style={{color:'red', fontSize:12}}>{error}</p>}
          <button style={{width:'100%', background:'#0d5c3a', color:'white', padding:12, borderRadius:8, marginTop:10, fontWeight:'bold'}}>Login</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh', background:'#f8faf9', fontFamily:'sans-serif'}}>
      <div style={{background:'white', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <div style={{width:40, height:40, background:'#ddd', borderRadius:'50%'}}></div>
          <div>
            <div style={{fontWeight:'bold', fontSize:14}}>Ezekiel Asomani</div>
            <div style={{fontSize:11, color:'#777'}}>{user.idNumber}</div>
          </div>
        </div>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <span>🔔 <span style={{background:'#0d5c3a', color:'white', fontSize:10, padding:'2px 6px', borderRadius:10}}>3</span></span>
          <button onClick={()=>{localStorage.clear(); setUser(null)}} style={{background:'#ff4444', color:'white', border:'none', padding:'6px 12px', borderRadius:8}}>Logout</button>
        </div>
      </div>

      <div style={{padding:16}}>
        <p style={{fontSize:13, color:'#555'}}>Complete your profile to access all welfare services.</p>
        <button style={{width:'100%', background:'#0d5c3a', color:'white', padding:12, borderRadius:8, marginTop:8, fontWeight:'600'}}>Complete Profile</button>

        <div style={{marginTop:24}}>
          <p>Good Evening, GH 👋</p>
          <h1 style={{fontSize:28, fontWeight:'bold', color:'#0d5c3a', margin:'4px 0'}}>My Welfare Journey</h1>
          <p style={{fontSize:13, color:'#777'}}>Welcome back.<br/>Here's your Welfare Journey.</p>

          <div style={{background:'#eef6ff', borderRadius:16, padding:20, marginTop:16, border:'1px solid #dbeafe'}}>
            <h3 style={{fontWeight:'bold', color:'#1a365d'}}>♡ You're building your welfare foundation</h3>
            <p style={{fontSize:13, color:'#555', marginTop:10}}>You have successfully completed 2 of the required 6 contributions.</p>
            <p style={{fontSize:13, color:'#555', marginTop:6}}>Only 4 more successful contributions to become eligible for welfare claims.</p>
            <p style={{fontWeight:'bold', fontSize:13, marginTop:14}}>Current Welfare Points: 2</p>
            <div style={{background:'white', height:8, borderRadius:10, marginTop:12, overflow:'hidden'}}>
              <div style={{background:'#0d5c3a', width:'33%', height:'100%'}}></div>
            </div>
            <p style={{fontSize:11, color:'#777', marginTop:4}}>2/6 completed</p>
          </div>
        </div>
      </div>
    </div>
  )
}