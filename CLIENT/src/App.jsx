import { useState, useRef } from 'react'

export default function App(){
  const [tab,setTab]=useState('dashboard')
  const [menu,setMenu]=useState(false)
  const [pic,setPic]=useState(localStorage.getItem('wonjuga_pic')||null)
  const fileRef=useRef(null)
  const onPic=e=>{
    const f=e.target.files[0]; if(!f) return
    const r=new FileReader()
    r.onloadend=()=>{ setPic(r.result); localStorage.setItem('wonjuga_pic',r.result)}
    r.readAsDataURL(f)
  }

  const C=({children})=> <div style={{background:'white',borderRadius:16,padding:16,marginBottom:12,border:'1px solid #e9ece4',boxShadow:'0 2px 8px rgba(0,0,0,0.03)'}}>{children}</div>

  return(
    <div style={{minHeight:'100vh',background:'#f4f5f0',fontFamily:'Inter,system-ui,sans-serif',display:'flex',justifyContent:'center'}}>
      <div style={{width:'100%',maxWidth:420,background:'#f4f5f0',minHeight:'100vh',position:'relative'}}>

        {/* HEADER */}
        <div style={{background:'white',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:20,borderBottom:'1px solid #eee'}}>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <span onClick={()=>setMenu(true)} style={{fontSize:20,cursor:'pointer'}}>☰</span>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:pic?`url(${pic})`:'#d9d9d9',backgroundSize:'cover',backgroundPosition:'center'}}></div>
              <div><div style={{fontSize:12,fontWeight:700}}>Ezekiel Asomani</div><div style={{fontSize:9,color:'#888'}}>GH/ADMIN001</div></div>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}><span>🔔</span><span style={{background:'red',color:'white',borderRadius:'50%',fontSize:9,padding:'2px 5px'}}>0</span></div>
        </div>

        {/* COMPLETE PROFILE BANNER */}
        <div style={{background:'#fef9c3',padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:11}}>Complete your profile to access all welfare services.</span>
          <button onClick={()=>setTab('profile')} style={{background:'#0d5c3a',color:'white',border:'none',borderRadius:20,padding:'6px 12px',fontSize:11,fontWeight:700}}>Complete Profile</button>
        </div>

        {/* DRAWER */}
        {menu && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:50}} onClick={()=>setMenu(false)}>
            <div style={{width:280,background:'white',height:'100%',padding:16}} onClick={e=>e.stopPropagation()}>
              <div style={{background:'#0d5c3a',color:'white',padding:12,borderRadius:12,marginBottom:12}}><b>WONJUGA WELFARE</b><div style={{fontSize:11,opacity:0.8}}>Staff Welfare Scheme</div></div>
              {[
                ['🏠 Dashboard','dashboard'],['👤 My Profile','profile'],['🤝 Welfare Support','support'],
                ['📝 My Claims','claims'],['💰 Contributions','contributions'],['📢 Announcements','announcements'],['🔔 Notifications','notifications']
              ].map(([l,id])=>(
                <div key={id} onClick={()=>{setTab(id); setMenu(false)}} style={{padding:14,background:tab===id?'#e8f5e9':'transparent',borderRadius:10,marginBottom:4,fontSize:13,fontWeight:tab===id?700:400,color:tab===id?'#0d5c3a':'#222',cursor:'pointer'}}>{l}</div>
              ))}
              <button onClick={()=>{localStorage.clear(); location.reload()}} style={{marginTop:20,width:'100%',padding:10,border:'1px solid #fecaca',background:'#fff1f2',borderRadius:10,color:'#ef4444',fontSize:12}}>Logout</button>
            </div>
          </div>
        )}

        <div style={{padding:14,paddingBottom:90}}>
          {tab==='dashboard' && (<>
            <p style={{fontSize:13,margin:0}}>Good Evening, Ezekiel 👋</p>
            <h2 style={{fontSize:20,fontWeight:800,margin:'4px 0'}}>My Welfare Journey</h2>
            <p style={{fontSize:11,color:'#666',marginBottom:12}}>Here's your Welfare Journey</p>

            <C>
              <div style={{display:'flex',gap:6}}><span>💎</span><b style={{fontSize:13}}>You're building your welfare foundation</b></div>
              <p style={{fontSize:11,color:'#555',marginTop:8,lineHeight:'16px'}}>You have successfully completed 2 of the required 6 contributions to become eligible for welfare claims.</p>
              <div style={{background:'#f6f7f3',padding:8,borderRadius:8,marginTop:8}}><span style={{fontSize:11}}><b>Current Welfare Points: 2</b></span></div>
            </C>

            <C>
              <b style={{fontSize:13}}>Progress Summary</b>
              <p style={{fontSize:11,color:'#777'}}>Engage, contribution position from the Progression</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
                <div><p style={{fontSize:9,color:'#999'}}>MEMBERSHIP STATUS</p><span style={{fontSize:11,background:'#fef3c7',color:'#92400e',padding:'3px 8px',borderRadius:12,fontWeight:700}}>Non eligible yet</span></div>
                <div><p style={{fontSize:9,color:'#999'}}>WELFARE POINTS</p><b style={{fontSize:12}}>2 / 36</b></div>
                <div><p style={{fontSize:9,color:'#999'}}>MEMBER SINCE</p><b style={{fontSize:11}}>27 Aug 2025</b></div>
                <div><p style={{fontSize:9,color:'#999'}}>MATURITY DATE</p><b style={{fontSize:11}}>27 Aug 2026</b></div>
              </div>
            </C>

            <C>
              <b style={{fontSize:12}}>🏅 Achievement Badge</b>
              <div style={{textAlign:'center',marginTop:12}}>
                <div style={{width:56,height:56,background:'#e8f5e9',borderRadius:'50%',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>🌱</div>
                <b style={{fontSize:13,display:'block',marginTop:8}}>Starter Member</b>
                <span style={{fontSize:10,color:'#777'}}>0-5 Welfare Points - Building foundation</span>
              </div>
            </C>

            <C><p style={{fontSize:11,color:'#888'}}>WELFARE PROGRESS</p><b>0%</b><p style={{fontSize:10,color:'#777'}}>Benefit percentage toward 36</p><div style={{background:'#eee',height:6,borderRadius:10,marginTop:8}}><div style={{width:'5%',height:'100%',background:'#0d5c3a'}}></div></div><p style={{fontSize:10,marginTop:6}}>2 / 36 Welfare Points</p></C>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <C><p style={{fontSize:9}}>NEXT MILESTONE</p><b style={{fontSize:11}}>6 Welfare Points</b><p style={{fontSize:9,color:'#777'}}>Only 4 more needed</p></C>
              <C><p style={{fontSize:9}}>MEMBERSHIP MATURITY</p><b style={{fontSize:11}}>25%</b><p style={{fontSize:9,color:'#777'}}>Next: 50% benefit</p></C>
              <C><p style={{fontSize:9}}>CONTRIBUTION STREAK</p><b>2</b><p style={{fontSize:9}}>Months</p></C>
              <C><p style={{fontSize:9}}>OUTSTANDING MONTHS</p><b>1</b><p style={{fontSize:9}}>Clear to maintain active</p><button style={{marginTop:6,background:'#0d5c3a',color:'white',border:'none',borderRadius:6,padding:'4px 10px',fontSize:10}}>Pay Now</button></C>
            </div>

            <C><b style={{fontSize:12}}>Why Consistency Matters</b><p style={{fontSize:11,color:'#555',marginTop:6}}>Regular contributions increase your benefit percentage and strengthen your future claims.</p><button onClick={()=>setTab('contributions')} style={{width:'100%',marginTop:10,background:'#eef6ee',border:'1px solid #c6eac6',color:'#0d5c3a',padding:10,borderRadius:10,fontSize:12,fontWeight:700}}>View All Welfare</button></C>

            <C><b style={{fontSize:12}}>📜 Official Welfare Constitution</b><p style={{fontSize:11,color:'#555',marginTop:6}}>The governing document for the GIS Welfare Scheme.</p><button style={{width:'100%',marginTop:10,background:'#0d5c3a',color:'white',border:'none',padding:10,borderRadius:10,fontSize:12}}>View Constitution</button></C>

            <C>
              <b style={{fontSize:13}}>Member Overview</b>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
                <div><p style={{fontSize:9,color:'#999'}}>TOTAL CONTRIBUTIONS</p><b style={{fontSize:16}}>2</b></div>
                <div><p style={{fontSize:9,color:'#999'}}>TOTAL AMOUNT PAID</p><b style={{fontSize:16}}>GHS 100.00</b></div>
              </div>
              <p style={{fontSize:10,color:'#777',marginTop:10}}>LAST PAYMENT: 29 Aug 2026 • GHS 50.00 Monthly • Payment method: Mobile Money</p>
            </C>
          </>)}

          {tab==='profile' && (<>
            <h2 style={{fontSize:18,fontWeight:800}}>My Profile</h2>
            <C>
              <div style={{display:'flex',justifyContent:'space-between'}}><b style={{fontSize:13}}>My Profile</b><span style={{fontSize:11,background:'#fef3c7',padding:'4px 8px',borderRadius:10}}>27% Complete</span></div>
              <div onClick={()=>fileRef.current.click()} style={{width:90,height:90,borderRadius:'50%',margin:'14px auto',background:pic?`url(${pic})`:'#eee',backgroundSize:'cover',backgroundPosition:'center',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,border:'3px solid #0d5c3a',cursor:'pointer'}}>{!pic && '📷'}</div>
              <p style={{textAlign:'center',fontSize:11,color:'#0d5c3a',fontWeight:700,cursor:'pointer'}} onClick={()=>fileRef.current.click()}>Edit Photo - Click to upload picture</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPic} style={{display:'none'}}/>
              <div style={{marginTop:16,fontSize:12,lineHeight:'24px'}}>
                <p><b>Full Name:</b> Ezekiel Asomani</p><p><b>Staff ID:</b> GH/ADMIN001</p><p><b>Phone:</b> 0550000001</p><p><b>Status:</b> Active Member ✅</p>
                <p style={{marginTop:10,color:'#0d5c3a',fontWeight:700}}>✅ Picture upload works perfectly!</p>
              </div>
              <button onClick={()=>setPic(null)} style={{marginTop:12,width:'100%',padding:10,border:'1px solid #fecaca',background:'white',color:'#ef4444',borderRadius:10,fontSize:12}}>Remove Picture</button>
            </C>
          </>)}

          {tab==='claims' && (<><h2>My Claims</h2><C>My Drafts (0) - You have no drafts yet</C><C>Submitted Claims (0)</C><C>Under Review (0)</C><C>Needs Revision (0)</C></>)}
          {tab==='contributions' && (<><h2>My Contributions</h2><C><b>GHS 50.00 - July 2026 Success</b></C><C><b>GHS 50.00 - Aug 2026 Success</b></C><C><b>Total: GHS 100.00 - 2 Contributions - 29 Aug 2026</b></C></>)}
          {tab==='support' && (<><h2>My Welfare Support</h2><C>No welfare assistance or paid benefits tracked yet</C></>)}
          {tab==='announcements' && (<><h2>Announcements</h2><C>No announcements from the welfare office</C></>)}
          {tab==='notifications' && (<><h2>Notification Centre</h2><C>✅ Payment Received - GHS 50 - 29 Aug 2026</C><C>✅ Contribution Received - 2 Months Streak</C></>)}
        </div>

        <div style={{position:'fixed',bottom:18,right:18,width:50,height:50,background:'#25D366',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>💬</div>
      </div>
    </div>
  )
}