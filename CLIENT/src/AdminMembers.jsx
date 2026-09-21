import { useState } from 'react'

export default function AdminMembers(){
  const [members,setMembers]=useState(JSON.parse(localStorage.getItem('wonjuga_all_members')||'[]'))
  const [form,setForm]=useState({fullName:'',idNumber:'',phone:'',rank:'',station:''})

  const add=()=>{
    if(!form.fullName || !form.idNumber) return alert('Name + Staff ID required')
    const list=[...members,{...form,status:'Pending',date:new Date().toLocaleDateString()}]
    localStorage.setItem('wonjuga_all_members',JSON.stringify(list))
    setMembers(list)
    setForm({fullName:'',idNumber:'',phone:'',rank:'',station:''})
    alert('✅ Added: '+form.fullName)
  }

  const del=(id)=>{
    const f=members.filter(m=>m.idNumber!==id)
    localStorage.setItem('wonjuga_all_members',JSON.stringify(f))
    setMembers(f)
  }

  return(
    <div style={{padding:14}}>
      <div style={{background:'white',padding:16,borderRadius:16}}>
        <h3 style={{fontSize:14,color:'#0d5c3a'}}>👑 Add Member</h3>
        <input placeholder="Full Name *" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd'}}/>
        <input placeholder="Staff ID * GH/..." value={form.idNumber} onChange={e=>setForm({...form,idNumber:e.target.value})} style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd'}}/>
        <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd'}}/>
        <input placeholder="Rank" value={form.rank} onChange={e=>setForm({...form,rank:e.target.value})} style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd'}}/>
        <input placeholder="Station" value={form.station} onChange={e=>setForm({...form,station:e.target.value})} style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd'}}/>
        <button onClick={add} style={{width:'100%',marginTop:12,background:'#0d5c3a',color:'white',border:'none',padding:12,borderRadius:10,fontWeight:700}}>Add Member</button>
      </div>

      <div style={{background:'white',padding:16,borderRadius:16,marginTop:12}}>
        <b style={{fontSize:12}}>Added ({members.length})</b>
        {members.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f1f1f1'}}>
            <div><b style={{fontSize:12}}>{m.fullName}</b><br/><span style={{fontSize:10}}>{m.idNumber} • {m.phone}</span></div>
            <button onClick={()=>del(m.idNumber)} style={{background:'#fff1f2',border:'1px solid #fecaca',color:'red',borderRadius:6,padding:'4px 8px',fontSize:10}}>Del</button>
          </div>
        ))}
      </div>
    </div>
  )
}