import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://wonjuga-server.onrender.com/api'

export default function App(){
  const [staffId, setStaffId] = useState('GH/ADMIN001')
  const [phone, setPhone] = useState('0550000001')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  const login = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try{
     const res = await axios.post(`${API_URL}/api/login`, { idNumber: staffId, phone })
      setUser(res.data)
    }catch(err){
      setError((err.response?.data?.message || err.message) + ` API:${API_URL}`)
    }finally{ setLoading(false) }
  }

  if(user){
    return <div style={{maxWidth:400,margin:'60px auto',background:'white',padding:32,borderRadius:16,boxShadow:'0 10px 30px rgba(0,0,0,.08)',textAlign:'center',fontFamily:'system-ui'}}>
      <h2 style={{margin:'0 0 8px'}}>WONJUGA Live ✨</h2>
      <p style={{color:'#64748b'}}>Welcome {user.name || staffId}</p>
      <p style={{fontSize:12,color:'#94a3b8',marginTop:20,wordBreak:'break-all'}}>Connected to {API_URL}</p>
      <button onClick={()=>setUser(null)} style={{marginTop:16,width:'100%',padding:12,background:'#0f172a',color:'white',borderRadius:8,border:'none',cursor:'pointer'}}>Logout</button>
    </div>
  }

  return (
    <div style={{maxWidth:420,margin:'60px auto',background:'white',padding:32,borderRadius:16,boxShadow:'0 10px 30px rgba(0,0,0,.08)',fontFamily:'system-ui'}}>
      <h1 style={{textAlign:'center',margin:'0 0 6px'}}>WONJUGA</h1>
      <p style={{textAlign:'center',color:'#64748b',margin:'0 0 20px'}}>Staff Portal Login</p>
      {error && <div style={{background:'#fef2f2',color:'#b91c1c',padding:10,borderRadius:8,marginBottom:12,fontSize:13}}>{error}</div>}
      <form onSubmit={login}>
        <label style={{fontSize:14,fontWeight:600}}>Staff ID</label>
        <input value={staffId} onChange={e=>setStaffId(e.target.value)} style={{width:'100%',padding:14,margin:'8px 0 16px',border:'1px solid #ddd',borderRadius:8,boxSizing:'border-box'}} required />
        <label style={{fontSize:14,fontWeight:600}}>Phone</label>
        <input value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%',padding:14,margin:'8px 0 16px',border:'1px solid #ddd',borderRadius:8,boxSizing:'border-box'}} required />
        <button disabled={loading} style={{width:'100%',padding:14,background:'#0f172a',color:'white',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>{loading?'Logging in...':'Login'}</button>
      </form>
      <p style={{textAlign:'center',fontSize:11,color:'#94a3b8',marginTop:16}}>API: {API_URL}</p>
    </div>
  )
}