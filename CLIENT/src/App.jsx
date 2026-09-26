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
const PAY = { number: "0559154973", name: "FHIL", default: 50 };

export default function App(){
  const [user,setUser]=useState(JSON.parse(localStorage.getItem("wonjuga_user")||"null"));
  const [isAdmin,setIsAdmin]=useState(localStorage.getItem("wonjuga_role")==="admin");
  const [tab,setTab]=useState("notifications");
  const [members,setMembers]=useState([]); const [requests,setRequests]=useState([]); const [anns,setAnns]=useState([]);
  const [filter,setFilter]=useState("all");
  const [loginForm,setLoginForm]=useState({serviceNo:"",password:""}); const [reqForm,setReqForm]=useState({serviceNo:"",phone:""});
  const [otp,setOtp]=useState(""); const [genOtp,setGenOtp]=useState(""); const [newPass,setNewPass]=useState("");
  const [addForm,setAddForm]=useState({fullName:"",phone:"",serviceNo:"",rank:""}); const [payAmount,setPayAmount]=useState(50);
  const [pic,setPic]=useState(localStorage.getItem("wonjuga_pic")||""); const [claimForm,setClaimForm]=useState({reason:"",amount:""});
  const fileRef=useRef();

  useEffect(()=>{
    const a=onSnapshot(collection(db,"members"),s=>setMembers(s.docs.map(d=>({id:d.id,...d.data()}))));
    const b=onSnapshot(collection(db,"welfareRequests"),s=>setRequests(s.docs.map(d=>({id:d.id,...d.data()}))));
    const c=onSnapshot(collection(db,"announcements"),s=>setAnns(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{a();b();c();}
  },[]);

  const unique=members.filter((m,i,arr)=>arr.findIndex(x=>x.serviceNo===m.serviceNo)===i);
  const myData=isAdmin?unique:unique.filter(m=>m.serviceNo===user?.serviceNo);
  const myPaid=myData[0]?.totalPaid||0;
  const greet=()=>{const h=new Date().getHours();return h<12?"Good Morning":h<18?"Good Afternoon":"Good Evening";};

  const login=async()=>{
    const q=query(collection(db,"members"),where("serviceNo","==",loginForm.serviceNo),where("password","==",loginForm.password));
    const snap=await getDocs(q); if(snap.empty)return alert("Wrong Service No or Password. Request Access first.");
    const u=snap.docs[0].data(); localStorage.setItem("wonjuga_user",JSON.stringify(u)); localStorage.setItem("wonjuga_role",u.role||"member");
    setUser(u); setIsAdmin((u.role||"member")==="admin"); setTab("dashboard");
  };
  const requestAccess=async()=>{
    const q=query(collection(db,"members"),where("serviceNo","==",reqForm.serviceNo)); const snap=await getDocs(q);
    if(snap.empty)return alert("Admin must add you first: Full Name, Phone, Service No");
    const code=Math.floor(100000+Math.random()*900000).toString(); setGenOtp(code);
    alert(`OTP to ${reqForm.phone}: ${code} (MTN/Vodafone/AirtelTigo auto-detect via your MTN bundle)`); setTab("otp");
  };
  const verifyOtp=()=>{if(otp!==genOtp)return alert("Wrong OTP"); setTab("createPass");};
  const createPass=async()=>{
    const q=query(collection(db,"members"),where("serviceNo","==",reqForm.serviceNo)); const snap=await getDocs(q); if(snap.empty)return;
    await updateDoc(doc(db,"members",snap.docs[0].id),{password:newPass,phone:reqForm.phone,status:"Active"}); alert("Password Created! Login now."); setTab("login");
  };
  const addMember=async()=>{
    if(!addForm.fullName||!addForm.serviceNo||!addForm.phone)return alert("Enter Full Name, Phone, Service No");
    if(unique.find(m=>m.serviceNo===addForm.serviceNo))return alert("Service No exists - fixes duplicate Ezekiel");
    await addDoc(collection(db,"members"),{fullName:addForm.fullName,name:addForm.fullName,phone:addForm.phone,serviceNo:addForm.serviceNo,rank:addForm.rank,role:"member",totalPaid:0,status:"Pending",createdAt:serverTimestamp()});
    alert(`${addForm.fullName} Added - Service: ${addForm.serviceNo}`); setAddForm({fullName:"",phone:"",serviceNo:"",rank:""});
  };
  const uploadPic=async(e)=>{
    const file=e.target.files[0]; if(!file)return; const r=ref(storage,`profilePics/${user.serviceNo}`);
    await uploadBytes(r,file); const url=await getDownloadURL(r); localStorage.setItem("wonjuga_pic",url); setPic(url);
    const q=query(collection(db,"members"),where("serviceNo","==",user.serviceNo)); const snap=await getDocs(q);
    if(!snap.empty)await updateDoc(doc(db,"members",snap.docs[0].id),{photoURL:url}); alert("Profile Picture Saved Permanently!");
  };
  const pay=async(m)=>{
    const member=m||myData[0]; if(!member)return; const amt=Number(payAmount); if(amt<50)return alert("Minimum 50 GHS. Pay more if outstanding debt.");
    await addDoc(collection(db,"welfareRequests"),{name:member.fullName,phone:member.phone,serviceNo:member.serviceNo,type:"Contribution",amount:amt,status:"Paid",reason:`Contribution Received - Payment of GHS ${amt}.00 has been received`,date:serverTimestamp()});
    const q=query(collection(db,"members"),where("serviceNo","==",member.serviceNo)); const snap=await getDocs(q);
    if(!snap.empty)await updateDoc(doc(db,"members",snap.docs[0].id),{totalPaid:(Number(snap.docs[0].data().totalPaid)||0)+amt}); alert(`Paid GHS ${amt} to FHIL ${PAY.number} hidden + Bank`); setPayAmount(50);
  };
  const submitClaim=async()=>{
    if(!claimForm.reason)return alert("Enter reason");
    await addDoc(collection(db,"welfareRequests"),{name:user.fullName,phone:user.phone,serviceNo:user.serviceNo,type:"Claim",reason:claimForm.reason,amount:Number(claimForm.amount)||0,status:"Pending",date:serverTimestamp()});
    alert("Claim Submitted"); setClaimForm({reason:"",amount:""}); setTab("claims");
  };

  if(!user){
    return(
      <div style={{minHeight:"100vh",background:"#f1f5f9",display:"flex",justifyContent:"center",alignItems:"center",padding:15}}>
        <div style={{background:"white",padding:30,borderRadius:16,width:"100%",maxWidth:400,textAlign:"center",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
          <div style={{width:60,height:60,background:"#166534",borderRadius:12,margin:"0 auto 15px",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:24}}>🛡️</div>
          <p style={{margin:0,fontSize:12,letterSpacing:1,color:"#64748b"}}>GIS INTAKE 28</p><h2 style={{margin:"5px 0"}}>Welfare Portal</h2><p style={{fontSize:13,color:"#64748b"}}>Sign in to manage your welfare contributions</p>
          <div style={{marginTop:20,textAlign:"left"}}><h3 style={{textAlign:"center"}}>Welcome Back</h3><p style={{textAlign:"center",fontSize:12,color:"#64748b"}}>Sign in to manage your welfare contributions</p>
          {(tab==="login"||tab==="dashboard")&&(<><label style={{fontSize:12}}>Service Number</label><input placeholder="BZ / 1350A" value={loginForm.serviceNo} onChange={e=>setLoginForm({...loginForm,serviceNo:e.target.value})} style={{width:"100%",padding:12,margin:"6px 0 10px",borderRadius:8,border:"1px solid #e2e8f0"}}/><label style={{fontSize:12}}>Password</label><input type="password" placeholder="Enter your password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} style={{width:"100%",padding:12,margin:"6px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><p style={{fontSize:11,color:"#64748b"}}>Minimum 6 characters</p><button onClick={login} style={{width:"100%",padding:12,background:"#166534",color:"white",border:"none",borderRadius:8,fontWeight:"bold",marginTop:10}}>Sign in</button><p style={{textAlign:"center",fontSize:11,marginTop:10,color:"#94a3b8"}}>Version 1.7.2</p><div style={{textAlign:"center",marginTop:10,fontSize:12}}><span>New member? </span><span onClick={()=>setTab("request")} style={{color:"#166534",cursor:"pointer",fontWeight:"bold"}}>Request Access</span></div></>)}
          {tab==="request"&&(<> <h4>Request Access</h4><input placeholder="Service No (Admin added)" value={reqForm.serviceNo} onChange={e=>setReqForm({...reqForm,serviceNo:e.target.value})} style={{width:"100%",padding:12,margin:"6px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><input placeholder="Phone" value={reqForm.phone} onChange={e=>setReqForm({...reqForm,phone:e.target.value})} style={{width:"100%",padding:12,margin:"6px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={requestAccess} style={{width:"100%",padding:12,background:"#166534",color:"white",border:"none",borderRadius:8}}>Send OTP (MTN Bundle)</button><button onClick={()=>setTab("login")} style={{width:"100%",padding:10,background:"#f1f5f9",border:"none",borderRadius:8,marginTop:8}}>Back to Login</button></>)}
          {tab==="otp"&&(<> <h4>Enter OTP - Auto detect MTN/Vodafone/AirtelTigo</h4><input placeholder="6-digit OTP" value={otp} onChange={e=>setOtp(e.target.value)} style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={verifyOtp} style={{width:"100%",padding:12,background:"#166534",color:"white",border:"none",borderRadius:8,marginTop:8}}>Verify</button></>)}
          {tab==="createPass"&&(<> <h4>Create Your Password</h4><input type="password" placeholder="Create Password (min 6 chars)" value={newPass} onChange={e=>setNewPass(e.target.value)} style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={createPass} style={{width:"100%",padding:12,background:"#166534",color:"white",border:"none",borderRadius:8,marginTop:8}}>Create & Login</button></>)}
          </div>
          <p style={{fontSize:10,color:"#94a3b8",marginTop:20}}>© 2025 GIS WONJUGA WELFARE • Powered by Wonjuga • Admin adds Full Name, Phone, Service No first</p>
        </div>
      </div>
    );
  }

  const menu=[
    {id:"dashboard",label:"Dashboard",icon:"📊"},
    {id:"profile",label:"My Profile",icon:"👤"},
    {id:"welfare",label:"Welfare Support",icon:"🤲"},
    {id:"claims",label:"My Claims",icon:"📝"},
    {id:"contributions",label:"Contributions",icon:"💰"},
    {id:"announcements",label:"Announcements",icon:"📢"},
    {id:"notifications",label:"Notifications",icon:"🔔"},
  ];
  const filtered=(isAdmin?requests:requests.filter(r=>r.serviceNo===user.serviceNo)).filter(r=> filter==="all"?true:r.status==="Pending");

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#f8fafc",fontFamily:"Inter, Arial"}}>
      <div style={{width:250,background:"white",borderRight:"1px solid #e2e8f0",padding:"0",position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <div style={{padding:"18px 15px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:"#166534",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>🛡️</div>
          <div><div style={{fontSize:12,fontWeight:"bold",lineHeight:1.1}}>GIS INTAKE 28<br/>WELFARE PORTAL</div></div>
        </div>
        <div style={{padding:"12px 10px"}}>
          {menu.map(m=>(
            <div key={m.id} onClick={()=>setTab(m.id)} style={{padding:"11px 12px",borderRadius:8,cursor:"pointer",margin:"3px 0",background:tab===m.id?"#166534":"transparent",color:tab===m.id?"white":"#334155",display:"flex",alignItems:"center",gap:10,fontSize:14,fontWeight:tab===m.id?"600":"400"}}>
              <span>{m.icon}</span>{m.label}{m.id==="notifications"&&requests.filter(r=>r.status==="Pending").length>0&&<span style={{marginLeft:"auto",background:tab===m.id?"white":"#ef4444",color:tab===m.id?"#166534":"white",borderRadius:10,padding:"1px 6px",fontSize:10}}>{requests.filter(r=>r.status==="Pending").length}</span>}
            </div>
          ))}
          {isAdmin&&<div onClick={()=>setTab("addMember")} style={{padding:"11px 12px",borderRadius:8,cursor:"pointer",margin:"12px 0",background:tab==="addMember"?"#1d4ed8":"#eff6ff",color:tab==="addMember"?"white":"#1d4ed8",fontSize:14}}>+ Add Member</div>}
        </div>
      </div>

      <div style={{flex:1}}>
        <div style={{background:"white",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #e2e8f0",position:"sticky",top:0,zIndex:5}}>
          <div><div style={{fontWeight:"bold"}}>{user.fullName}</div><div style={{fontSize:12,color:"#64748b"}}>{greet()} - Complete your profile to access welfare services</div></div>
          <div style={{display:"flex",alignItems:"center",gap:15}}>
            <span style={{fontSize:13,cursor:"pointer"}} onClick={()=>setTab("notifications")}>🔔 Notifications</span>
            <span onClick={()=>setTab("profile")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:8}}><img src={pic||user?.photoURL||`https://ui-avatars.com/api/?name=${user.fullName}&background=166534&color=fff`} style={{width:34,height:34,borderRadius:"50%"}} alt=""/><small>▼</small></span>
            <button onClick={()=>{localStorage.clear();location.reload();}} style={{background:"#ef4444",color:"white",border:"none",padding:"6px 12px",borderRadius:6,fontSize:12}}>Logout</button>
            <input type="file" ref={fileRef} onChange={uploadPic} accept="image/*" style={{display:"none"}}/>
          </div>
        </div>

        <div style={{padding:24,maxWidth:900}}>
          {tab==="dashboard"&&(
            <>
              <h2 style={{margin:"0 0 5px"}}>Dashboard</h2><p style={{color:"#64748b",fontSize:13,margin:"0 0 15px"}}>{greet()}, {user.fullName} - Your welfare overview</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                <div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><small>Total Contributions</small><h2 style={{margin:"5px 0"}}>GHS {isAdmin?unique.reduce((a,b)=>a+(Number(b.totalPaid)||0),0):myPaid}.00</h2><small style={{color:"#16a34a"}}>{myPaid>=50?"Up to date":"Outstanding GHS "+(50-myPaid)}</small></div>
                <div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><small>Members</small><h2 style={{margin:"5px 0"}}>{isAdmin?unique.length:1}</h2><small>{isAdmin?"Total":"My Account"}</small></div>
                <div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><small>Claims</small><h2 style={{margin:"5px 0"}}>{requests.length}</h2><small>{requests.filter(r=>r.status==="Pending").length} Pending</small></div>
              </div>
              <div style={{background:"white",padding:16,borderRadius:12,border:"1px solid #e2e8f0",marginTop:16,borderLeft:"4px solid #166534"}}>
                <h4 style={{margin:"0 0 8px"}}>💳 Pay Contribution - GHS 50 Default (Pay More If Debt)</h4>
                <p style={{fontSize:12,color:"#64748b",margin:"0 0 10px"}}>Minimum 50 GHS. If you have outstanding debt, you can pay 100, 150, 200 etc. Payment secured to FHIL {PAY.number} (hidden) + Bank 0559154973.</p>
                <div style={{display:"flex",gap:10}}><input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)} min="50" placeholder="50 or more" style={{flex:1,padding:10,borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={()=>pay()} style={{padding:"10px 20px",background:"#166534",color:"white",border:"none",borderRadius:8,fontWeight:"bold"}}>Pay GHS {payAmount}</button></div>
              </div>
            </>
          )}

          {tab==="notifications"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><h2 style={{margin:0}}>Notification Centre</h2><p style={{color:"#64748b",fontSize:13,margin:"5px 0"}}>Stay updated on your welfare contributions, payments and announcements.</p></div><button onClick={()=>fileRef.current.click()} style={{background:"#f97316",color:"white",border:"none",padding:"8px 14px",borderRadius:8,fontSize:12}}>Complete Profile</button></div>
              <div style={{background:"white",borderRadius:12,border:"1px solid #e2e8f0",padding:16,marginTop:15}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{display:"flex",gap:8}}><button onClick={()=>setFilter("all")} style={{padding:"6px 14px",borderRadius:20,border:"1px solid #e2e8f0",background:filter==="all"?"#166534":"white",color:filter==="all"?"white":"#334155",fontSize:12}}>All</button><button onClick={()=>setFilter("unread")} style={{padding:"6px 14px",borderRadius:20,border:"1px solid #e2e8f0",background:filter==="unread"?"#166534":"white",color:filter==="unread"?"white":"#334155",fontSize:12}}>Unread ({requests.filter(r=>r.status==="Pending").length})</button></div>
                  <button onClick={async()=>{for(const r of requests){await updateDoc(doc(db,"welfareRequests",r.id),{status:"Read"})}}} style={{background:"none",border:"none",color:"#166534",fontSize:12,cursor:"pointer"}}>Mark all as read</button>
                </div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:10}}>Showing {filtered.length} notifications • {filtered.filter(r=>r.status==="Pending").length} unread</div>
                {filtered.map(r=>(
                  <div key={r.id} style={{padding:"16px 0",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between"}}>
                    <div style={{display:"flex",gap:12}}><div style={{width:8,height:8,background:r.status==="Pending"?"#22c55e":"#e2e8f0",borderRadius:"50%",marginTop:6}}></div>
                      <div><div style={{fontWeight:"600",fontSize:14}}>{r.type==="Contribution"?"Contribution Received":r.type==="Claim"?"Payment Received":"Announcement Published"}</div>
                        <div style={{fontSize:13,color:"#475569",margin:"4px 0"}}>{r.reason||`Payment of GHS ${r.amount}.00 has been received`}</div>
                        <div style={{display:"flex",gap:16,marginTop:6}}><span style={{fontSize:12,color:"#166534",cursor:"pointer"}}>👁 View {r.type==="Contribution"?"Contribution":"Payment"}</span><span onClick={async()=>await updateDoc(doc(db,"welfareRequests",r.id),{status:"Read"})} style={{fontSize:12,color:"#64748b",cursor:"pointer"}}>✓ Mark as read</span></div>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:"#94a3b8",whiteSpace:"nowrap"}}>{new Date().toLocaleDateString()}</div>
                  </div>
                ))}
                {filtered.length===0&&<p style={{textAlign:"center",color:"#94a3b8",padding:20}}>No notifications</p>}
              </div>
            </div>
          )}

          {tab==="profile"&&(<div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><h3>My Profile</h3><img src={pic||user?.photoURL||`https://ui-avatars.com/api/?name=${user.fullName}&background=166534&color=fff`} style={{width:80,height:80,borderRadius:"50%"}} alt=""/><p><b>Full Name:</b> {user.fullName}</p><p><b>Phone:</b> {user.phone}</p><p><b>Service No:</b> {user.serviceNo}</p><p><b>Rank:</b> {user.rank}</p><p><b>Total Paid:</b> GHS {myPaid} (Default 50, pay more if debt)</p><button onClick={()=>fileRef.current.click()} style={{padding:"10px 20px",background:"#166534",color:"white",border:"none",borderRadius:6}}>Upload Picture (Permanent at right top)</button></div>)}
          {tab==="welfare"&&(<div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><h3>Welfare Support</h3><input placeholder="Reason for support" value={claimForm.reason} onChange={e=>setClaimForm({...claimForm,reason:e.target.value})} style={{width:"100%",padding:10,margin:"6px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><input placeholder="Amount (optional)" type="number" value={claimForm.amount} onChange={e=>setClaimForm({...claimForm,amount:e.target.value})} style={{width:"100%",padding:10,margin:"6px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={submitClaim} style={{width:"100%",padding:12,background:"#166534",color:"white",border:"none",borderRadius:8}}>Submit Request</button></div>)}
          {tab==="claims"&&(<div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><h3>My Claims</h3>{(isAdmin?requests:requests.filter(r=>r.serviceNo===user.serviceNo)).map(r=>(<div key={r.id} style={{padding:"12px 0",borderBottom:"1px solid #eee",display:"flex",justifyContent:"space-between"}}><span><b>{r.name}</b> ({r.serviceNo}) - GHS {r.amount} - {r.status}<br/><small>{r.reason}</small></span><div>{isAdmin&&r.status==="Pending"&&<button onClick={async()=>await updateDoc(doc(db,"welfareRequests",r.id),{status:"Approved"})} style={{background:"#166534",color:"white",border:"none",borderRadius:6,padding:"6px 10px",marginRight:5}}>Approve</button>}<button onClick={async()=>await deleteDoc(doc(db,"welfareRequests",r.id))} style={{background:"#ef4444",color:"white",border:"none",borderRadius:6,padding:"6px 10px"}}>Delete</button></div></div>))}</div>)}
          {tab==="contributions"&&(<div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><h3>Contributions - 50 GHS Default</h3><p style={{fontSize:12,color:"#64748b"}}>Pay more if outstanding debt. Secured to FHIL hidden 0559154973 + Bank.</p>{(isAdmin?unique:myData).map(m=>(<div key={m.id} style={{padding:"10px 0",borderBottom:"1px solid #eee",display:"flex",justifyContent:"space-between"}}><span>{m.fullName} ({m.serviceNo}) - Paid GHS {m.totalPaid||0} {Number(m.totalPaid)<50?`(Owes ${50-Number(m.totalPaid)})`:""}</span><b>GHS {m.totalPaid||0}</b></div>))}<div style={{display:"flex",gap:10,marginTop:15}}><input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)} min="50" style={{flex:1,padding:10,borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={()=>pay()} style={{padding:"10px 20px",background:"#166534",color:"white",border:"none",borderRadius:8}}>Pay GHS {payAmount} (50+ if debt)</button></div></div>)}
          {tab==="announcements"&&(<div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><h3>Announcements</h3>{isAdmin&&<div style={{display:"flex",gap:10,marginBottom:15}}><input id="ann" placeholder="New announcement" style={{flex:1,padding:10,borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={async()=>{const v=document.getElementById("ann").value;if(!v)return;await addDoc(collection(db,"announcements"),{text:v,date:serverTimestamp()});document.getElementById("ann").value="";}} style={{padding:"10px 15px",background:"#166534",color:"white",border:"none",borderRadius:8}}>Publish</button></div>}{anns.map(a=>(<div key={a.id} style={{padding:"12px 0",borderBottom:"1px solid #eee"}}>{a.text}</div>))}</div>)}
          {tab==="addMember"&&isAdmin&&(<div style={{background:"white",padding:20,borderRadius:12,border:"1px solid #e2e8f0"}}><h3>Admin - Add Members (Full Name, Phone, Service No)</h3><p style={{fontSize:12,color:"#64748b"}}>How to approve: Add here → Member clicks Request Access at bottom → OTP via your MTN bundle (auto-detect network) → Create password → Good to go</p><input placeholder="Full Name" value={addForm.fullName} onChange={e=>setAddForm({...addForm,fullName:e.target.value})} style={{width:"100%",padding:10,margin:"5px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><input placeholder="Phone" value={addForm.phone} onChange={e=>setAddForm({...addForm,phone:e.target.value})} style={{width:"100%",padding:10,margin:"5px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><input placeholder="Service No - Unique (prevents duplicate)" value={addForm.serviceNo} onChange={e=>setAddForm({...addForm,serviceNo:e.target.value})} style={{width:"100%",padding:10,margin:"5px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><input placeholder="Rank" value={addForm.rank} onChange={e=>setAddForm({...addForm,rank:e.target.value})} style={{width:"100%",padding:10,margin:"5px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={addMember} style={{width:"100%",padding:12,background:"#166534",color:"white",border:"none",borderRadius:8,fontWeight:"bold"}}>Add Member</button><div style={{marginTop:15}}>{unique.map(m=>(<div key={m.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #eee",fontSize:12}}><span>{m.fullName} | {m.serviceNo} | {m.phone} | GHS {m.totalPaid||0}</span><button onClick={async()=>await deleteDoc(doc(db,"members",m.id))} style={{background:"red",color:"white",border:"none",borderRadius:4,padding:"4px 8px"}}>Delete</button></div>))}</div></div>)}
        </div>
      </div>
    </div>
  );
}
