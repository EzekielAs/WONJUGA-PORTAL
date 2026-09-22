import { useState } from 'react'

export default function AdminMembers(){
  const [name, setName] = useState('')
  const [staffId, setStaffId] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')

  const handleAdd = () => {
    if(!name || !staffId || !phone){
      setMsg('Fill all fields')
      return
    }
    const all = JSON.parse(localStorage.getItem('wonjuga_all_members') || '[]')
    all.push({ 
      fullName: name, 
      idNumber: staffId.toUpperCase(), 
      phone: phone,
      addedAt: new Date().toLocaleString()
    })
    localStorage.setItem('wonjuga_all_members', JSON.stringify(all))
    setMsg(`✅ Added ${name} - ${staffId}`)
    setName(''); setStaffId(''); setPhone('')
  }

  const members = JSON.parse(localStorage.getItem('wonjuga_all_members') || '[]')

  return (
    <div style={{padding:20}}>
      <h2 style={{fontWeight:700, marginBottom:10}}>👑 Admin - Add Members</h2>
      <p style={{fontSize:13, color:'#666', marginBottom:15}}>Add new members who can then verify and join.</p>
      
      <div style={{background:'white', padding:16, borderRadius:12, marginBottom:20}}>
        <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} style={{width:'100%', padding:10, marginBottom:8, borderRadius:8, border:'1px solid #ccc'}} />
        <input placeholder="Staff ID e.g. GH/12345" value={staffId} onChange={e=>setStaffId(e.target.value)} style={{width:'100%', padding:10, marginBottom:8, borderRadius:8, border:'1px solid #ccc'}} />
        <input placeholder="Phone e.g. 0241234567" value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%', padding:10, marginBottom:8, borderRadius:8, border:'1px solid #ccc'}} />
        <button onClick={handleAdd} style={{width:'100%', padding:12, background:'#0d5c3a', color:'white', borderRadius:8, border:'none', fontWeight:700, cursor:'pointer'}}>Add Member</button>
        {msg && <p style={{marginTop:10, fontSize:13, color: msg.includes('✅') ? 'green' : 'red'}}>{msg}</p>}
      </div>

      <h3 style={{fontWeight:600, marginBottom:8}}>All Added Members ({members.length})</h3>
      {members.map((m,i)=>(
        <div key={i} style={{background:'white', padding:10, borderRadius:8, marginBottom:6, fontSize:13}}>
          <b>{m.fullName}</b> - {m.idNumber} - {m.phone}
        </div>
      ))}
    </div>
  )
}