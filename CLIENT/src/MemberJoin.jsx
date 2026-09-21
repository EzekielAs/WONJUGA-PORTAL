import { useState } from 'react'

export default function MemberJoin({onSuccess}){
  const [id,setId]=useState('')
  const [phone,setPhone]=useState('')
  const [password,setPassword]=useState('')
  const [step,setStep]=useState(1) // 1=verify, 2=create password
  const [foundMember,setFoundMember]=useState(null)

  const verify=()=>{
    const all=JSON.parse(localStorage.getItem('wonjuga_all_members')||'[]')
    const member=all.find(m=> m.idNumber.toLowerCase().trim()===id.toLowerCase().trim() && m.phone.trim()===phone.trim())
    if(!member){
      alert('❌ Access Denied! Admin has not added you.\n\nYour Staff ID: '+id+' not found.\nContact admin to add you first.')
      return
    }
    setFoundMember(member)
    setStep(2)
  }

  const createAccount=()=>{
    if(password.length<4) return alert('Password must be 4+ characters')
    const account={...foundMember,password,joinedDate:new Date().toLocaleDateString()}
    localStorage.setItem('wonjuga_user',JSON.stringify(account))
    // update status to Joined
    const all=JSON.parse(localStorage.getItem('wonjuga_all_members')||'[]')
    const updated=all.map(m=> m.idNumber===foundMember.idNumber? {...m,status:'Joined'}:m)
    localStorage.setItem('wonjuga_all_members',JSON.stringify(updated))
    alert('✅ Welcome '+foundMember.fullName+'! Account created!')
    location.reload()
  }

  return(
    <div style={{minHeight:'100vh',background:'#f4f5f0',display:'flex',justifyContent:'center',alignItems:'center',padding:16,fontFamily:'system-ui'}}>
      <div style={{background:'white',padding:24,borderRadius:16,width:'100%',maxWidth:360}}>
        <h2 style={{color:'#0d5c3a',textAlign:'center'}}>WONJUGA WELFARE</h2>
        <p style={{fontSize:11,color:'#777',textAlign:'center',marginTop:4}}>{step===1?'Member Verification - Enter your details':'Create Password'}</p>

        {step===1 && (
          <>
            <input placeholder="Staff ID e.g GH/12345" value={id} onChange={e=>setId(e.target.value)} style={{width:'100%',padding:12,marginTop:16,borderRadius:10,border:'1px solid #ddd'}}/>
            <input placeholder="Phone number used by Admin" value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%',padding:12,marginTop:10,borderRadius:10,border:'1px solid #ddd'}}/>
            <button onClick={verify} style={{width:'100%',marginTop:16,background:'#0d5c3a',color:'white',border:'none',padding:12,borderRadius:10,fontWeight:700}}>Verify My Access</button>
            <p style={{fontSize:10,color:'#999',marginTop:12,textAlign:'center'}}>You must be added by Admin first. If not added, you cannot join.</p>
          </>
        )}

        {step===2 && (
          <>
            <div style={{background:'#e8f5e9',padding:12,borderRadius:10,marginTop:12}}>
              <b style={{fontSize:12}}>✅ Verified: {foundMember.fullName}</b><br/>
              <span style={{fontSize:11}}>{foundMember.idNumber} • {foundMember.rank}</span>
            </div>
            <input type="password" placeholder="Create your password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:12,marginTop:12,borderRadius:10,border:'1px solid #ddd'}}/>
            <button onClick={createAccount} style={{width:'100%',marginTop:12,background:'#0d5c3a',color:'white',border:'none',padding:12,borderRadius:10,fontWeight:700}}>Create Account & Join</button>
          </>
        )}
      </div>
    </div>
  )
}