export default function MemberJoin(){
  const verify = () => {
    const id = document.getElementById('vid').value.toUpperCase()
    const phone = document.getElementById('vphone').value
    const all = JSON.parse(localStorage.getItem('wonjuga_all_members') || '[]')
    
    // Admin bypass
    if(id === 'GH/ADMIN' && phone === '0240000000'){
      localStorage.setItem('wonjuga_user', JSON.stringify({fullName:'Admin', idNumber:'GH/ADMIN', phone}))
      location.reload()
      return
    }

    const found = all.find(m => m.idNumber.toUpperCase() === id && m.phone === phone)
    if(!found){
      alert('❌ Access Denied - Not added by Admin yet')
      return
    }
    localStorage.setItem('wonjuga_user', JSON.stringify(found))
    location.reload()
  }

  return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f5', padding:20}}>
      <div style={{background:'white', padding:24, borderRadius:16, width:'100%', maxWidth:400}}>
        <h2 style={{fontWeight:800, fontSize:20, marginBottom:4}}>WONJUGA Verification</h2>
        <p style={{fontSize:13, color:'#666', marginBottom:16}}>Enter Staff ID and Phone added by Admin</p>
        <input id="vid" placeholder="Staff ID e.g. GH/12345" style={{width:'100%', padding:12, marginBottom:10, borderRadius:8, border:'1px solid #ccc'}} />
        <input id="vphone" placeholder="Phone e.g. 0241234567" style={{width:'100%', padding:12, marginBottom:12, borderRadius:8, border:'1px solid #ccc'}} />
        <button onClick={verify} style={{width:'100%', padding:12, background:'#0d5c3a', color:'white', borderRadius:8, border:'none', fontWeight:700}}>Verify & Join</button>
        <p style={{fontSize:11, color:'#999', marginTop:12}}>Admin Test: GH/ADMIN / 0240000000</p>
      </div>
    </div>
  )
}