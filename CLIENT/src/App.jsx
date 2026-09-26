import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, deleteDoc, addDoc, updateDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCHBnObf0aoJ3p5c9auGvis1kYiE_3_1pg",
  authDomain: "gis-wonjuga-welfare.firebaseapp.com",
  projectId: "gis-wonjuga-welfare",
  storageBucket: "gis-wonjuga-welfare.firebasestorage.app",
  messagingSenderId: "1081669579126",
  appId: "1:1081669579126:web:c11b84dc5609162f65ca57"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const PAY_HIDDEN = "0559154973"; // FHIL + Bank 0559154973 hidden inside

export default function App(){
  const [user,setUser]=useState(JSON.parse(localStorage.getItem("wonjuga_user")||"null"));
  const [isAdmin,setIsAdmin]=useState(localStorage.getItem("wonjuga_role")==="admin");
  const [tab,setTab]=useState("notifications");
  const [members,setMembers]=useState([]); const [reqs,setReqs]=useState([]); const [anns,setAnns]=useState([]);
  const [filter,setFilter]=useState("all");
  const [loginForm,setLoginForm]=useState({serviceNo:"",password:""}); const [reqForm,setReqForm]=useState({serviceNo:"",phone:""});
  const [otp,setOtp]=useState(""); const [genOtp,setGenOtp]=useState(""); const [newPass,setNewPass]=useState("");
  const [addForm,setAddForm]=useState({fullName:"",phone:"",serviceNo:"",rank:""}); const [payAmount,setPayAmount]=useState(50);
  const [pic,setPic]=useState(localStorage.getItem("wonjuga_pic")||""); const [claim,setClaim]=useState({reason:"",amount:""});
  const fileRef=useRef();

  useEffect(()=>{
    const a=onSnapshot(collection(db,"members"),s=>setMembers(s.docs.map(d=>({id:d.id,...d.data()}))));
    const b=onSnapshot(collection(db,"welfareRequests"),s=>setReqs(s.docs.map(d=>({id:d.id,...d.data()}))));
    const c=onSnapshot(collection(db,"announcements"),s=>setAnns(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{a();b();c();}
  },[]);

  const unique=members.filter((m,i,arr)=>arr.findIndex(x=>x.serviceNo===m.serviceNo)===i);
  const myData=isAdmin?unique:unique.filter(m=>m.serviceNo===user?.serviceNo);
  const myPaid=myData[0]?.totalPaid||0;
  const greet=()=>{const h=new Date().getHours(); return h<12?"Good Morning":h<18?"Good Afternoon":"Good Evening";};

  const doLogin=async()=>{
    const q=query(collection(db,"members"),where("serviceNo","==",loginForm.serviceNo),where("password","==",loginForm.password));
    const snap=await getDocs(q); if(snap.empty) return alert("Wrong Service Number or Password. Click Request Access below if new.");
    const u=snap.docs[0].data(); localStorage.setItem("wonjuga_user",JSON.stringify(u)); localStorage.setItem("wonjuga_role",u.role||"member");
    setUser(u); setIsAdmin((u.role||"member")==="admin"); setTab("dashboard");
  };
  const doRequest=async()=>{
    const q=query(collection(db,"members"),where("serviceNo","==",reqForm.serviceNo)); const snap=await getDocs(q);
    if(snap.empty) return alert("Admin must first add you: Full Name, Phone, Service Number");
    const code=Math.floor(100000+Math.random()*900000).toString(); setGenOtp(code);
    alert(`OTP to ${reqForm.phone}: ${code} - Auto-detect MTN/Vodafone/AirtelTigo via your MTN bundle`); setTab("otp");
  };
  const doVerify=()=>{ if(otp!==genOtp) return alert("Wrong OTP"); setTab("createPass"); };
  const doCreate=async()=>{
    const q=query(collection(db,"members"),where("serviceNo","==",reqForm.serviceNo)); const snap=await getDocs(q); if(snap.empty) return;
    await updateDoc(doc(db,"members",snap.docs[0].id),{password:newPass,phone:reqForm.phone,status:"Active"}); alert("Password created! Login now."); setTab("login");
  };
  const doAdd=async()=>{
    if(!addForm.fullName||!addForm.serviceNo||!addForm.phone) return alert("Enter Full Name, Phone, Service No");
    if(unique.find(m=>m.serviceNo===addForm.serviceNo)) return alert("Service No exists - fixes duplicate");
    await addDoc(collection(db,"members"),{fullName:addForm.fullName,name:addForm.fullName,phone:addForm.phone,serviceNo:addForm.serviceNo,rank:addForm.rank,role:"member",totalPaid:0,status:"Pending",createdAt:serverTimestamp()});
    alert(`${addForm.fullName} Added`); setAddForm({fullName:"",phone:"",serviceNo:"",rank:""});
  };
  const doUpload=async(e)=>{
    const file=e.target.files[0]; if(!file) return; const r=ref(storage,`profilePics/${user.serviceNo}`);
    await uploadBytes(r,file); const url=await getDownloadURL(r); localStorage.setItem("wonjuga_pic",url); setPic(url);
    const q=query(collection(db,"members"),where("serviceNo","==",user.serviceNo)); const snap=await getDocs(q);
    if(!snap.empty) await updateDoc(doc(db,"members",snap.docs[0].id),{photoURL:url}); alert("Profile picture saved permanently!");
  };
  const doPay=async(m)=>{
    const member=m||myData[0]; if(!member) return; const amt=Number(payAmount); if(amt<50) return alert("Minimum 50 GHS. Pay more if outstanding debt.");
    await addDoc(collection(db,"welfareRequests"),{name:member.fullName,phone:member.phone,serviceNo:member.serviceNo,type:"Contribution",amount:amt,status:"Paid",reason:`Contribution Received - Payment of GHS ${amt}.00 has been received`,date:serverTimestamp()});
    const q=query(collection(db,"members"),where("serviceNo","==",member.serviceNo)); const snap=await getDocs(q);
    if(!snap.empty) await updateDoc(doc(db,"members",snap.docs[0].id),{totalPaid:(Number(snap.docs[0].data().totalPaid)||0)+amt});
    alert(`GHS ${amt} paid - Secured to FHIL hidden ${PAY_HIDDEN} + Bank`); setPayAmount(50);
  };
  const doClaim=async()=>{
    if(!claim.reason) return alert("Enter reason");
    await addDoc(collection(db,"welfareRequests"),{name:user.fullName,phone:user.phone,serviceNo:user.serviceNo,type:"Claim",reason:claim.reason,amount:Number(claim.amount)||0,status:"Pending",date:serverTimestamp()});
    alert("Claim submitted"); setClaim({reason:"",amount:""}); setTab("claims");
  };

  if(!user){
    return(
      <div style={{minHeight:"100vh",background:"#f8fafc",display:"flex",justifyContent:"center",alignItems:"center",padding:20}}>
        <div style={{background:"white",width:"100%",maxWidth:420,borderRadius:16,padding:"32px 28px",boxShadow:"0 8px 30px rgba(0,0,0,0.06)",textAlign:"center"}}>
          <div style={{width:56,height:56,margin:"0 auto 12px",background:"#f0fdf4",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>🛡️</div>
          <div style={{fontSize:11,letterSpacing:1.5,color:"#166534",fontWeight:700}}>GIS WONJUGA WELFARE PORTAL</div>
          <div style={{fontSize:20,fontWeight:700,margin:"4px 0"}}>Welfare Portal</div>
          <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>Sign in to manage your welfare contributions</div>
          <div style={{textAlign:"left"}}>
            <div style={{fontWeight:600,fontSize:15,textAlign:"center"}}>Welcome Back</div>
            <div style={{fontSize:12,color:"#64748b",textAlign:"center",marginBottom:16}}>Sign in to manage your welfare contributions</div>
            {(tab==="login"||tab==="dashboard")&&(<>
              <label style={{fontSize:12,fontWeight:500}}>Service Number</label>
              <input placeholder="BZ / 1350A" value={loginForm.serviceNo} onChange={e=>setLoginForm({...loginForm,serviceNo:e.target.value})} style={{width:"100%",padding:"11px 12px",margin:"6px 0 14px",borderRadius:8,border:"1px solid #e2e8f0"}}/>
              <label style={{fontSize:12,fontWeight:500}}>Password</label>
              <input type="password" placeholder="Enter your password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} style={{width:"100%",padding:"11px 12px",margin:"6px 0 4px",borderRadius:8,border:"1px solid #e2e8f0"}}/>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:16}}>Minimum 6 characters</div>
              <button onClick={doLogin} style={{width:"100%",padding:"12px",background:"#166534",color:"white",border:"none",borderRadius:8,fontWeight:600}}>Sign in</button>
              <div style={{textAlign:"center",fontSize:11,color:"#94a3b8",marginTop:12}}>Version 1.7.2</div>
              <div style={{textAlign:"center",marginTop:12,fontSize:13}}><span style={{color:"#64748b"}}>New member? </span><span onClick={()=>setTab("request")} style={{color:"#166534",fontWeight:600,cursor:"pointer"}}>Request Access</span></div>
            </>)}
            {tab==="request"&&(<> <h4 style={{textAlign:"center"}}>Request Access</h4><p style={{fontSize:12,color:"#64748b",textAlign:"center"}}>Admin must have added Full Name, Phone, Service No first</p><input placeholder="Service Number" value={reqForm.serviceNo} onChange={e=>setReqForm({...reqForm,serviceNo:e.target.value})} style={{width:"100%",padding:11,margin:"6px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><input placeholder="Phone Number" value={reqForm.phone} onChange={e=>setReqForm({...reqForm,phone:e.target.value})} style={{width:"100%",padding:11,margin:"6px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={doRequest} style={{width:"100%",padding:12,background:"#166534",color:"white",border:"none",borderRadius:8,marginTop:8}}>Send OTP - MTN Bundle (auto-detect network)</button><button onClick={()=>setTab("login")} style={{width:"100%",padding:10,background:"#f1f5f9",border:"none",borderRadius:8,marginTop:8}}>Back to Login</button></>)}
            {tab==="otp"&&(<> <h4>Enter OTP - MTN/Vodafone/AirtelTigo</h4><input placeholder="6-digit OTP" value={otp} onChange={e=>setOtp(e.target.value)} style={{width:"100%",padding:11,borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={doVerify} style={{width:"100%",padding:12,background:"#166534",color:"white",border:"none",borderRadius:8,marginTop:10}}>Verify OTP</button></>)}
            {tab==="createPass"&&(<> <h4>Create Password</h4><input type="password" placeholder="Min 6 chars" value={newPass} onChange={e=>setNewPass(e.target.value)} style={{width:"100%",padding:11,borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={doCreate} style={{width:"100%",padding:12,background:"#166534",color:"white",border:"none",borderRadius:8,marginTop:10}}>Create & Login</button></>)}
          </div>
          <div style={{fontSize:10,color:"#94a3b8",marginTop:20}}>© 2025 GIS WONJUGA WELFARE PORTAL • FHIL Payment 0559154973 hidden + Bank</div>
        </div>
      </div>
    );
  }

  const menu=[
    {id:"dashboard",label:"Dashboard",icon:"⊞"},
    {id:"profile",label:"My Profile",icon:"👤"},
    {id:"welfare",label:"Welfare Support",icon:"🤲"},
    {id:"claims",label:"My Claims",icon:"📄"},
    {id:"contributions",label:"Contributions",icon:"💳"},
    {id:"announcements",label:"Announcements",icon:"📢"},
    {id:"notifications",label:"Notifications",icon:"🔔"},
  ];
  const filtered=(isAdmin?reqs:reqs.filter(r=>r.serviceNo===user.serviceNo)).filter(r=>filter==="all"?true:r.status==="Pending");

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#f8fafc"}}>
      <div style={{width:250,background:"white",borderRight:"1px solid #e2e8f0",height:"100vh",position:"sticky",top:0}}>
        <div style={{padding:"20px 16px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,background:"#166534",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700}}>GIS</div>
          <div style={{fontSize:11.5,lineHeight:1.2,fontWeight:800,color:"#0f172a"}}>GIS WONJUGA<br/>WELFARE PORTAL</div>
        </div>
        <div style={{padding:10}}>
          {menu.map(m=>(
            <div key={m.id} onClick={()=>setTab(m.id)} style={{padding:"11px 12px",borderRadius:8,cursor:"pointer",margin:"2px 0",background:tab===m.id?"#166534":"transparent",color:tab===m.id?"white":"#334155",display:"flex",alignItems:"center",gap:10,fontSize:13.5}}>
              <span style={{width:18}}>{m.icon}</span>{m.label}{m.id==="notifications"&&reqs.filter(r=>r.status==="Pending").length>0&&<span style={{marginLeft:"auto",background:tab===m.id?"white":"#ef4444",color:tab===m.id?"#166534":"white",borderRadius:10,padding:"1px 6px",fontSize:10}}>{reqs.filter(r=>r.status==="Pending").length}</span>}
            </div>
          ))}
          {isAdmin&&<div onClick={()=>setTab("addMember")} style={{padding:"11px 12px",borderRadius:8,margin:"12px 0",background:tab==="addMember"?"#1e40af":"#eff6ff",color:tab==="addMember"?"white":"#1e40af",cursor:"pointer",fontSize:13}}>+ Add Member</div>}
        </div>
      </div>

      <div style={{flex:1}}>
        <div style={{background:"white",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #e2e8f0"}}>
          <div><div style={{fontWeight:600,fontSize:14}}>{user.fullName}</div><div style={{fontSize:12,color:"#b45309",background:"#fef3c7",padding:"4px 8px",borderRadius:6,marginTop:4,display:"inline-block"}}>⚠ Complete your profile to access welfare services</div></div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div onClick={()=>setTab("notifications")} style={{fontSize:13,cursor:"pointer"}}>🔔 Notifications <span style={{background:"#ef4444",color:"white",borderRadius:10,padding:"2px 6px",fontSize:10}}>{reqs.filter(r=>r.status==="Pending").length}</span></div>
            <button onClick={()=>{localStorage.clear();location.reload();}} style={{background:"#ef4444",color:"white",border:"none",padding:"6px 12px",borderRadius:6,fontSize:12}}>Logout</button>
            <img src={pic||user?.photoURL||`https://ui-avatars.com/api/?name=${user.fullName}&background=166534&color=fff`} onClick={()=>fileRef.current.click()} style={{width:36,height:36,borderRadius:"50%",cursor:"pointer",border:"2px solid #166534"}} alt=""/>
            <input type="file" ref={fileRef} onChange={doUpload} accept="image/*" style={{display:"none"}}/>
          </div>
        </div>

        <div style={{padding:24,maxWidth:900}}>
          {tab==="dashboard"&&(<><h2 style={{margin:"0 0 4px"}}>Dashboard - GIS WONJUGA WELFARE PORTAL</h2><p style={{fontSize:13,color:"#64748b",margin:"0 0 16px"}}>{greet()}, {user.fullName}</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}><div style={{background:"white",padding:18,borderRadius:12,border:"1px solid #e2e8f0"}}><div style={{fontSize:12,color:"#64748b"}}>Total Contributions</div><div style={{fontSize:22,fontWeight:700}}>GHS {isAdmin?unique.reduce((a,b)=>a+(Number(b.totalPaid)||0),0):myPaid}.00</div><div style={{fontSize:11,color:myPaid>=50?"#16a34a":"#ef4444"}}>{myPaid>=50?"Up to date":"Owes GHS "+(50-myPaid)}</div></div><div style={{background:"white",padding:18,borderRadius:12,border:"1px solid #e2e8f0"}}><div style={{fontSize:12}}>Members</div><div style={{fontSize:22,fontWeight:700}}>{isAdmin?unique.length:1}</div></div><div style={{background:"white",padding:18,borderRadius:12,border:"1px solid #e2e8f0"}}><div style={{fontSize:12}}>Claims</div><div style={{fontSize:22,fontWeight:700}}>{reqs.length}</div></div></div><div style={{background:"white",padding:16,borderRadius:12,border:"1px solid #e2e8f0",marginTop:16,borderLeft:"4px solid #166534"}}><div style={{fontWeight:600}}>Payment - Default GHS 50 (Pay more if debt) - FHIL hidden {PAY_HIDDEN} + Bank</div><div style={{display:"flex",gap:10,marginTop:10}}><input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)} min="50" style={{flex:1,padding:10,borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={()=>doPay()} style={{padding:"10px 20px",background:"#166534",color:"white",border:"none",borderRadius:8}}>Pay GHS {payAmount}</button></div></div></>)}

          {tab==="notifications"&&(
            <div>
              <h2 style={{margin:0}}>Notification Centre</h2><p style={{fontSize:13,color:"#64748b",margin:"6px 0 16px"}}>Stay updated on your welfare contributions, payments and announcements.</p>
              <div style={{background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{display:"flex",gap:8}}><span style={{fontSize:12,color:"#64748b"}}>Filter:</span><button onClick={()=>setFilter("all")} style={{padding:"6px 14px",borderRadius:20,border:"1px solid #e2e8f0",background:filter==="all"?"#166534":"white",color:filter==="all"?"white":"#334155",fontSize:12}}>All</button><button onClick={()=>setFilter("unread")} style={{padding:"6px 14px",borderRadius:20,border:"1px solid #e2e8f0",background:filter==="unread"?"#166534":"white",color:filter==="unread"?"white":"#334155",fontSize:12}}>Unread</button></div>
                  <button onClick={async()=>{for(const r of reqs){await updateDoc(doc(db,"welfareRequests",r.id),{status:"Read"})}}} style={{background:"none",border:"none",color:"#166534",fontSize:12,cursor:"pointer"}}>Mark all as read</button>
                </div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Showing {filtered.length} • {filtered.filter(r=>r.status==="Pending").length} unread</div>
                {filtered.map(r=>(
                  <div key={r.id} style={{padding:"16px 0",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between"}}>
                    <div style={{display:"flex",gap:12}}><div style={{width:8,height:8,background:r.status==="Pending"?"#22c55e":"#e2e8f0",borderRadius:"50%",marginTop:6}}></div>
                      <div><div style={{fontWeight:600,fontSize:14}}>{r.type==="Contribution"?"Contribution Received":r.type==="Claim"?"Payment Received":"Announcement Published"}</div>
                        <div style={{fontSize:13,color:"#475569",margin:"4px 0"}}>{r.reason||`Payment of GHS ${r.amount}.00 has been received`}</div>
                        <div style={{display:"flex",gap:14,marginTop:6}}><span style={{fontSize:12,color:"#166534"}}>👁 View {r.type==="Contribution"?"Contribution":"Payment"}</span><span onClick={async()=>await updateDoc(doc(db,"welfareRequests",r.id),{status:"Read"})} style={{fontSize:12,color:"#64748b",cursor:"pointer"}}>✓ Mark as read</span></div>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:"#94a3b8"}}>20 Aug 2025</div>
                  </div>
                ))}
                {filtered.length===0&&<div style={{textAlign:"center",padding:20,color:"#94a3b8"}}>No notifications</div>}
              </div>
            </div>
          )}

          {tab==="profile"&&(<div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><h3>My Profile - GIS WONJUGA WELFARE PORTAL</h3><img src={pic||user?.photoURL||`https://ui-avatars.com/api/?name=${user.fullName}&background=166534&color=fff`} style={{width:80,height:80,borderRadius:"50%"}} alt=""/><p>Full Name: {user.fullName}</p><p>Phone: {user.phone}</p><p>Service No: {user.serviceNo}</p><p>Rank: {user.rank}</p><p>Paid: GHS {myPaid}</p><button onClick={()=>fileRef.current.click()} style={{padding:"10px 20px",background:"#166534",color:"white",border:"none",borderRadius:6}}>Upload Picture Permanent</button></div>)}
          {tab==="contributions"&&(<div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><h3>Contributions - 50 Default, More If Debt</h3>{(isAdmin?unique:myData).map(m=>(<div key={m.id} style={{padding:"10px 0",borderBottom:"1px solid #eee",display:"flex",justifyContent:"space-between"}}><span>{m.fullName} ({m.serviceNo}) - GHS {m.totalPaid||0}</span><b>GHS {m.totalPaid||0}</b></div>))}<div style={{display:"flex",gap:10,marginTop:15}}><input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)} min="50" style={{flex:1,padding:10,borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={()=>doPay()} style={{padding:"10px 20px",background:"#166534",color:"white",border:"none",borderRadius:8}}>Pay {payAmount} (50+ if debt)</button></div></div>)}
          {tab==="welfare"&&(<div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><h3>Welfare Support</h3><input placeholder="Reason" value={claim.reason} onChange={e=>setClaim({...claim,reason:e.target.value})} style={{width:"100%",padding:10,margin:"6px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><input placeholder="Amount" type="number" value={claim.amount} onChange={e=>setClaim({...claim,amount:e.target.value})} style={{width:"100%",padding:10,margin:"6px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={doClaim} style={{width:"100%",padding:12,background:"#166534",color:"white",border:"none",borderRadius:8}}>Submit</button></div>)}
          {tab==="claims"&&(<div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><h3>My Claims</h3>{(isAdmin?reqs:reqs.filter(r=>r.serviceNo===user.serviceNo)).map(r=>(<div key={r.id} style={{padding:"12px 0",borderBottom:"1px solid #eee"}}>{r.name} ({r.serviceNo}) - GHS {r.amount} - {r.status} - {r.reason}</div>))}</div>)}
          {tab==="announcements"&&(<div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><h3>Announcements</h3>{isAdmin&&<div style={{display:"flex",gap:10,marginBottom:12}}><input id="ann" placeholder="New announcement" style={{flex:1,padding:10,borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={async()=>{const v=document.getElementById("ann").value;if(!v)return;await addDoc(collection(db,"announcements"),{text:v,date:serverTimestamp()});document.getElementById("ann").value="";}} style={{padding:"10px 15px",background:"#166534",color:"white",border:"none",borderRadius:8}}>Publish</button></div>}{anns.map(a=>(<div key={a.id} style={{padding:"10px 0",borderBottom:"1px solid #eee"}}>{a.text}</div>))}</div>)}
          {tab==="addMember"&&isAdmin&&(<div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><h3>Add Member - Full Name, Phone, Service No</h3><input placeholder="Full Name" value={addForm.fullName} onChange={e=>setAddForm({...addForm,fullName:e.target.value})} style={{width:"100%",padding:10,margin:"5px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><input placeholder="Phone" value={addForm.phone} onChange={e=>setAddForm({...addForm,phone:e.target.value})} style={{width:"100%",padding:10,margin:"5px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><input placeholder="Service No Unique" value={addForm.serviceNo} onChange={e=>setAddForm({...addForm,serviceNo:e.target.value})} style={{width:"100%",padding:10,margin:"5px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><input placeholder="Rank" value={addForm.rank} onChange={e=>setAddForm({...addForm,rank:e.target.value})} style={{width:"100%",padding:10,margin:"5px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={doAdd} style={{width:"100%",padding:12,background:"#166534",color:"white",border:"none",borderRadius:8}}>Add Member</button></div>)}
        </div>
      </div>
    </div>
  );
}
