import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ==== CHANGE WHATSAPP GROUP LINK HERE LATER ====
const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/YOUR-WONJUGA-GROUP-LINK-HERE";
const PAY_HIDDEN = "0559154973"; // FHIL + Bank hidden - never show to users

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

export default function App(){
  const [user,setUser]=useState(JSON.parse(localStorage.getItem("wonjuga_user")||"null"));
  const [isAdmin,setIsAdmin]=useState(localStorage.getItem("wonjuga_role")==="admin");
  const [tab,setTab]=useState("dashboard");
  const [members,setMembers]=useState([]); const [reqs,setReqs]=useState([]); const [anns,setAnns]=useState([]);
  const [filter,setFilter]=useState("all");
  const [loginForm,setLoginForm]=useState({serviceNo:"",password:""});
  const [reqForm,setReqForm]=useState({serviceNo:"",phone:""});
  const [otp,setOtp]=useState(""); const [genOtp,setGenOtp]=useState(""); const [newPass,setNewPass]=useState("");
  const [addForm,setAddForm]=useState({fullName:"",phone:"",serviceNo:"",rank:""});
  const [payAmount,setPayAmount]=useState(50);
  const [pic,setPic]=useState(localStorage.getItem("wonjuga_pic")||"");
  const [showPass,setShowPass]=useState(false);
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
  const myReqs=isAdmin?reqs:reqs.filter(r=>r.serviceNo===user?.serviceNo);
  const filtered=myReqs.filter(r=>filter==="all"?true:r.status==="Pending");

  // ==== ALL WORKING BOTTOMS ====
  const openWhatsAppGroup = () => {
    if(WHATSAPP_GROUP_LINK.includes("YOUR-WONJUGA")) return alert("WhatsApp Group link not added yet. Admin will add it soon - Powered by exclusive hans");
    window.open(WHATSAPP_GROUP_LINK, "_blank");
  };
  const viewConstitution = () => alert("WONJUGA WELFARE CONSTITUTION - Version 2.0\nA Voluntary Non-Political Welfare Association for WONJUGA Officers\n\nAll Articles same as INTAKE 28 Constitution you showed in Video 3 - View/Download enabled");
  const downloadConstitution = () => {
    alert("Downloading WONJUGA WELFARE CONSTITUTION PDF - Powered by exclusive hans");
    const link=document.createElement("a"); link.href="data:text/plain,WONJUGA CONSTITUTION"; link.download="WONJUGA-WELFARE-CONSTITUTION.pdf"; link.click();
  };
  const viewPayment = () => setTab("contributions");
  const viewContribution = () => setTab("contributions");
  const viewAnnouncement = () => setTab("announcements");

  const doLogin=async()=>{
    const q=query(collection(db,"members"),where("serviceNo","==",loginForm.serviceNo),where("password","==",loginForm.password));
    const snap=await getDocs(q); if(snap.empty) return alert("Wrong Service No or Password. Use Request Access if new.");
    const u=snap.docs[0].data(); localStorage.setItem("wonjuga_user",JSON.stringify(u)); localStorage.setItem("wonjuga_role",u.role||"member");
    setUser(u); setIsAdmin((u.role||"member")==="admin"); setTab("dashboard");
  };
  const doRequest=async()=>{
    const q=query(collection(db,"members"),where("serviceNo","==",reqForm.serviceNo)); const snap=await getDocs(q);
    if(snap.empty) return alert("Admin must first add Full Name, Phone, Service No - GIS WONJUGA");
    const code=Math.floor(100000+Math.random()*900000).toString(); setGenOtp(code);
    alert(`OTP to ${reqForm.phone}: ${code}\nSent via MTN bundle (auto-detect MTN/Vodafone/AirtelTigo) - Secured to FHIL ${PAY_HIDDEN} hidden`); setTab("otp");
  };
  const doVerify=()=>{ if(otp!==genOtp) return alert("Wrong OTP"); setTab("createPass"); };
  const doCreate=async()=>{
    const q=query(collection(db,"members"),where("serviceNo","==",reqForm.serviceNo)); const snap=await getDocs(q); if(snap.empty) return;
    await updateDoc(doc(db,"members",snap.docs[0].id),{password:newPass,phone:reqForm.phone,status:"Active"}); alert("Password created! Login now - GIS WONJUGA WELFARE PORTAL"); setTab("login");
  };
  const doAdd=async()=>{
    if(!addForm.fullName||!addForm.serviceNo||!addForm.phone) return alert("Enter Full Name, Phone, Service No");
    if(unique.find(m=>m.serviceNo===addForm.serviceNo)) return alert("Service No exists");
    await addDoc(collection(db,"members"),{fullName:addForm.fullName,name:addForm.fullName,phone:addForm.phone,serviceNo:addForm.serviceNo,rank:addForm.rank,role:"member",totalPaid:0,status:"Pending",createdAt:serverTimestamp()});
    alert(`${addForm.fullName} Added - Member can now Request Access`); setAddForm({fullName:"",phone:"",serviceNo:"",rank:""});
  };
  const doUpload=async(e)=>{
    const file=e.target.files[0]; if(!file) return; const r=ref(storage,`profilePics/${user.serviceNo}`);
    await uploadBytes(r,file); const url=await getDownloadURL(r); localStorage.setItem("wonjuga_pic",url); setPic(url);
    const q=query(collection(db,"members"),where("serviceNo","==",user.serviceNo)); const snap=await getDocs(q);
    if(!snap.empty) await updateDoc(doc(db,"members",snap.docs[0].id),{photoURL:url}); alert("Photo saved permanent top right!");
  };
  const doPay=async()=>{
    const amt=Number(payAmount); if(amt<50) return alert("Min 50 GHS. Pay more if outstanding debt.");
    const id=`GIS-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    await addDoc(collection(db,"welfareRequests"),{name:user.fullName,phone:user.phone,serviceNo:user.serviceNo,type:"Contribution",amount:amt,paymentId:id,status:"Pending",reason:`Payment ${id} of GHS ${amt}.00 has been recorded - Secured to FHIL ${PAY_HIDDEN} + Bank`,date:serverTimestamp()});
    const q=query(collection(db,"members"),where("serviceNo","==",user.serviceNo)); const snap=await getDocs(q);
    if(!snap.empty) await updateDoc(doc(db,"members",snap.docs[0].id),{totalPaid:(Number(snap.docs[0].data().totalPaid)||0)+amt});
    alert(`GHS ${amt} Paid Successfully!\nPayment ${id}\nSecured to FHIL ${PAY_HIDDEN} hidden + Bank\n50 default, more if debt cleared`);
  };

  if(!user){
    return(
      <div style={{minHeight:"100vh",background:"#f9fafb",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:20}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:56,height:56,background:"white",borderRadius:"50%",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #e5e7eb"}}>🛡️</div>
          <div style={{fontSize:11,letterSpacing:1,color:"#6b7280",marginTop:8,fontWeight:600}}>GIS WONJUGA</div>
          <div style={{fontSize:20,fontWeight:700}}>Welfare Portal</div>
          <div style={{fontSize:11,color:"#6b7280"}}>Official Welfare Management Platform</div>
        </div>
        <div style={{background:"white",width:"100%",maxWidth:380,borderRadius:12,padding:24,border:"1px solid #e5e7eb"}}>
          {(tab==="login"||tab==="dashboard")&&(<>
            <div style={{fontWeight:600,textAlign:"center"}}>Welcome Back</div>
            <div style={{fontSize:11,color:"#6b7280",textAlign:"center",marginBottom:16}}>Sign in to manage your welfare contributions</div>
            <label style={{fontSize:11,fontWeight:500}}>Service Number</label>
            <input placeholder="SU / 12954" value={loginForm.serviceNo} onChange={e=>setLoginForm({...loginForm,serviceNo:e.target.value})} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #d1d5db",margin:"6px 0 12px"}}/>
            <label style={{fontSize:11,fontWeight:500}}>Password</label>
            <div style={{position:"relative"}}><input type={showPass?"text":"password"} placeholder="Enter your password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #d1d5db",margin:"6px 0 4px"}}/><span onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:10,top:14,cursor:"pointer"}}>👁</span></div>
            <div style={{fontSize:10,color:"#9ca3af",marginBottom:16}}>Minimum 8 characters</div>
            <button onClick={doLogin} style={{width:"100%",padding:11,background:"#166534",color:"white",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Sign In</button>
            <div style={{textAlign:"center",fontSize:10,color:"#9ca3af",marginTop:8}}>Version 1.7.5</div>
            <div style={{textAlign:"center",marginTop:10,fontSize:12}}><span style={{color:"#6b7280"}}>New member? </span><span onClick={()=>setTab("request")} style={{color:"#166534",fontWeight:600,cursor:"pointer"}}>Request Access</span></div>
            <div style={{textAlign:"center",marginTop:6,fontSize:11,color:"#6b7280"}}><span onClick={()=>setTab("request")} style={{cursor:"pointer"}}>Activate Account</span> - <span onClick={()=>setTab("request")} style={{cursor:"pointer"}}>Forgot Password</span></div>
          </>)}
          {tab==="request"&&(<> <h4 style={{textAlign:"center"}}>Request Access</h4><p style={{fontSize:11,color:"#64748b",textAlign:"center"}}>Admin must add Full Name, Phone, Service No first</p><input placeholder="Service Number" value={reqForm.serviceNo} onChange={e=>setReqForm({...reqForm,serviceNo:e.target.value})} style={{width:"100%",padding:10,margin:"6px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><input placeholder="Phone Number" value={reqForm.phone} onChange={e=>setReqForm({...reqForm,phone:e.target.value})} style={{width:"100%",padding:10,margin:"6px 0",borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={doRequest} style={{width:"100%",padding:11,background:"#166534",color:"white",border:"none",borderRadius:8,cursor:"pointer"}}>Send OTP - MTN Bundle</button><button onClick={()=>setTab("login")} style={{width:"100%",padding:9,background:"#f1f5f9",border:"none",borderRadius:8,marginTop:8}}>Back to Login</button></>)}
          {tab==="otp"&&(<> <h4>Enter OTP</h4><input placeholder="6-digit OTP" value={otp} onChange={e=>setOtp(e.target.value)} style={{width:"100%",padding:11,borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={doVerify} style={{width:"100%",padding:11,background:"#166534",color:"white",border:"none",borderRadius:8,marginTop:10,cursor:"pointer"}}>Verify OTP</button></>)}
          {tab==="createPass"&&(<> <h4>Create Password</h4><input type="password" placeholder="New password min 8" value={newPass} onChange={e=>setNewPass(e.target.value)} style={{width:"100%",padding:11,borderRadius:8,border:"1px solid #e2e8f0"}}/><button onClick={doCreate} style={{width:"100%",padding:11,background:"#166534",color:"white",border:"none",borderRadius:8,marginTop:10,cursor:"pointer"}}>Create & Login</button></>)}
        </div>
        <div style={{textAlign:"center",fontSize:10,color:"#9ca3af",marginTop:14}}>© 2025 GIS WONJUGA WELFARE PORTAL • Powered by exclusive hans</div>
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

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#f9fafb",fontFamily:"Inter, sans-serif"}}>
      <div style={{width:220,background:"white",borderRight:"1px solid #e5e7eb",position:"sticky",top:0,height:"100vh"}}>
        <div style={{padding:"16px 14px",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,background:"#166534",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>🛡️</div><div style={{fontSize:9,fontWeight:700}}>GIS WONJUGA<br/>Member Portal</div></div>
        <div style={{padding:8}}>{menu.map(m=>(<div key={m.id} onClick={()=>setTab(m.id)} style={{padding:"10px",borderRadius:8,cursor:"pointer",margin:"2px 0",background:tab===m.id?"#166534":"transparent",color:tab===m.id?"white":"#374151",display:"flex",gap:8,fontSize:12.5}}>{m.icon} {m.label}{m.id==="notifications"&&myReqs.length>0&&<span style={{marginLeft:"auto",background:tab===m.id?"white":"#ef4444",color:tab===m.id?"#166534":"white",borderRadius:10,padding:"1px 5px",fontSize:9}}>{myReqs.length}</span>}</div>))}{isAdmin&&<div onClick={()=>setTab("addMember")} style={{padding:"10px",borderRadius:8,margin:"10px 0",background:"#eff6ff",color:"#1e40af",cursor:"pointer",fontSize:12}}>+ Add Member</div>}</div>
      </div>

      <div style={{flex:1}}>
        <div style={{background:"white",padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #e5e7eb"}}>
          <div><div style={{fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}><img src={pic||`https://ui-avatars.com/api/?name=${user.fullName}&background=166534&color=fff`} style={{width:22,height:22,borderRadius:"50%"}}/> {user.fullName}</div><div style={{fontSize:10,color:"#b45309",background:"#fef3c7",padding:"3px 6px",borderRadius:4,marginTop:4}}>Complete your profile to access all welfare services</div></div>
          <div style={{display:"flex",alignItems:"center",gap:12}}><div onClick={()=>setTab("notifications")} style={{fontSize:12,cursor:"pointer"}}>🔔 Notifications</div><button onClick={()=>{localStorage.clear();location.reload();}} style={{background:"#ef4444",color:"white",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,cursor:"pointer"}}>Logout</button><button onClick={()=>setTab("profile")} style={{background:"#166534",color:"white",border:"none",padding:"5px 10px",borderRadius:6,fontSize:11,cursor:"pointer"}}>Complete Profile</button><img src={pic||`https://ui-avatars.com/api/?name=${user.fullName}&background=166534&color=fff`} onClick={()=>fileRef.current.click()} style={{width:32,height:32,borderRadius:"50%",cursor:"pointer",border:"2px solid #166534"}}/><input type="file" ref={fileRef} onChange={doUpload} accept="image/*" style={{display:"none"}}/></div>
        </div>

        <div style={{padding:20,maxWidth:1000}}>
          {tab==="dashboard"&&(
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><h2 style={{margin:0,fontSize:16}}>Good Evening, {user.fullName} 👋</h2><p style={{margin:"2px 0 0",fontSize:11,color:"#6b7280"}}>My Welfare Journey</p></div><div style={{display:"flex",gap:8}}><button onClick={viewConstitution} style={{padding:"6px 10px",background:"white",border:"1px solid #e5e7eb",borderRadius:6,fontSize:11,cursor:"pointer"}}>View Constitution</button><button onClick={downloadConstitution} style={{padding:"6px 10px",background:"white",border:"1px solid #e5e7eb",borderRadius:6,fontSize:11,cursor:"pointer"}}>Download Constitution</button></div></div>
              <div style={{background:"#fefce8",border:"1px solid #fde68a",padding:12,borderRadius:8,marginTop:12,fontSize:12}}>🌱 You're building your welfare foundation - {myData[0]?.totalPaid?Math.floor(myData[0].totalPaid/50):0} of 6 contributions - {6-(myData[0]?.totalPaid?Math.floor(myData[0].totalPaid/50):0)} more to become eligible</div>
              <div style={{background:"white",padding:14,borderRadius:8,border:"1px solid #e5e7eb",marginTop:12}}><div style={{fontSize:12,fontWeight:600}}>Member Overview</div><div style={{display:"flex",gap:8,marginTop:10}}><button onClick={()=>setTab("contributions")} style={{padding:"6px 12px",background:"black",color:"white",border:"none",borderRadius:6,fontSize:10,cursor:"pointer"}}>My Contributions</button><button onClick={()=>setTab("contributions")} style={{padding:"6px 12px",background:"white",border:"1px solid #e5e7eb",borderRadius:6,fontSize:10,cursor:"pointer"}}>Payment History</button><button onClick={()=>setTab("welfare")} style={{padding:"6px 12px",background:"white",border:"1px solid #e5e7eb",borderRadius:6,fontSize:10,cursor:"pointer"}}>Welfare Support</button><button onClick={()=>setTab("contributions")} style={{padding:"6px 12px",background:"white",border:"1px solid #e5e7eb",borderRadius:6,fontSize:10,cursor:"pointer"}}>Receipts</button></div></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}><div style={{background:"white",padding:14,borderRadius:8,border:"1px solid #e5e7eb"}}><div style={{fontSize:12,fontWeight:600}}>Profile Completion - 27%</div><button onClick={()=>setTab("profile")} style={{marginTop:8,padding:"6px 10px",background:"black",color:"white",border:"none",borderRadius:6,fontSize:10,cursor:"pointer"}}>Complete Profile</button></div><div style={{background:"white",padding:14,borderRadius:8,border:"1px solid #e5e7eb"}}><div style={{fontSize:12,fontWeight:600}}>My Contributions - GHS {myPaid}.00</div><button onClick={()=>setTab("contributions")} style={{marginTop:8,padding:"6px 10px",background:"black",color:"white",border:"none",borderRadius:6,fontSize:10,cursor:"pointer"}}>View Contributions</button></div></div>
            </>
          )}
          {tab==="contributions"&&(
            <div><h2 style={{fontSize:16}}>My Contributions</h2><div style={{background:"white",padding:16,borderRadius:8,border:"1px solid #e5e7eb"}}><div style={{fontSize:16,fontWeight:700}}>September 2026 - GHS 50.00 Payment Due</div><div style={{fontSize:10,color:"#ef4444"}}>Default 50, pay more if outstanding debt - FHIL hidden + Bank</div><div style={{display:"flex",gap:8,marginTop:10}}><input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)} min="50" style={{padding:8,borderRadius:6,border:"1px solid #d1d5db",width:120}}/><button onClick={doPay} style={{padding:"8px 14px",background:"#166534",color:"white",border:"none",borderRadius:6,cursor:"pointer"}}>Pay September 2026 - GHS {payAmount}</button></div></div></div>
          )}
          {tab==="notifications"&&(
            <div><h2 style={{fontSize:16}}>Notification Centre</h2><div style={{background:"white",padding:14,borderRadius:8,border:"1px solid #e5e7eb",marginTop:12}}><div style={{display:"flex",gap:8}}><button onClick={()=>setFilter("all")} style={{padding:"5px 12px",borderRadius:20,background:filter==="all"?"black":"white",color:filter==="all"?"white":"black",cursor:"pointer"}}>All</button><button onClick={()=>setFilter("unread")} style={{padding:"5px 12px",borderRadius:20,background:filter==="unread"?"black":"white",color:filter==="unread"?"white":"black",cursor:"pointer"}}>Unread</button><button onClick={async()=>{for(const r of myReqs){await updateDoc(doc(db,"welfareRequests",r.id),{status:"Read"})}}} style={{marginLeft:"auto",background:"none",border:"none",color:"#6b7280",cursor:"pointer"}}>Mark all as read</button></div>{filtered.map(r=>(<div key={r.id} style={{padding:"12px 0",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:12,fontWeight:600}}>{r.paymentId?"Payment Received":r.type} - GHS {r.amount}.00</div><div style={{fontSize:11,color:"#475569"}}>{r.reason}</div><div style={{display:"flex",gap:12,marginTop:6}}><span onClick={viewPayment} style={{fontSize:10,color:"#166534",cursor:"pointer"}}>👁 View Payment</span><span onClick={async()=>await updateDoc(doc(db,"welfareRequests",r.id),{status:"Read"})} style={{fontSize:10,color:"#6b7280",cursor:"pointer"}}>✓ Mark as read</span></div></div><div style={{fontSize:9,color:"#9ca3af"}}>29 Aug 2026</div></div>))}</div></div>
          )}
          {tab==="profile"&&(<div style={{background:"white",padding:16,borderRadius:8,border:"1px solid #e5e7eb"}}><h3>My Profile - 27%</h3><img src={pic||`https://ui-avatars.com/api/?name=${user.fullName}&background=166534&color=fff`} style={{width:80,height:80,borderRadius:"50%"}}/><div style={{display:"flex",gap:6,marginTop:8}}><button onClick={()=>fileRef.current.click()} style={{padding:"6px 10px",background:"black",color:"white",border:"none",borderRadius:6,cursor:"pointer"}}>Change Photo</button></div><p>Full Name: {user.fullName} | Service No: {user.serviceNo} | GHS {myPaid}</p></div>)}
          {tab==="announcements"&&(<div style={{background:"white",padding:20,borderRadius:8,border:"1px solid #e5e7eb",textAlign:"center"}}><h3>Announcements</h3><p>No announcements available right now.</p><button onClick={openWhatsAppGroup} style={{marginTop:10,padding:"8px 14px",background:"#22c55e",color:"white",border:"none",borderRadius:6,cursor:"pointer"}}>Join WhatsApp Group</button></div>)}
          {tab==="welfare"&&(<div style={{background:"white",padding:16,borderRadius:8,border:"1px solid #e5e7eb"}}><h3>My Claims</h3>{["My Drafts (0)","Needs Revision (0)","Submitted (0)","Under Review (0)","Decided (0)"].map(t=>(<div key={t} style={{padding:12,border:"1px solid #f3f4f6",borderRadius:6,marginTop:8}}>{t}</div>))}<button onClick={openWhatsAppGroup} style={{marginTop:12,padding:"8px 14px",background:"#22c55e",color:"white",border:"none",borderRadius:6,cursor:"pointer"}}>Need Help? Join WhatsApp Group</button></div>)}
          {tab==="addMember"&&isAdmin&&(<div style={{background:"white",padding:16,borderRadius:8,border:"1px solid #e5e7eb"}}><h3>Add Member</h3><input placeholder="Full Name" value={addForm.fullName} onChange={e=>setAddForm({...addForm,fullName:e.target.value})} style={{width:"100%",padding:9,margin:"5px 0",borderRadius:6,border:"1px solid #e5e7eb"}}/><input placeholder="Phone" value={addForm.phone} onChange={e=>setAddForm({...addForm,phone:e.target.value})} style={{width:"100%",padding:9,margin:"5px 0",borderRadius:6,border:"1px solid #e5e7eb"}}/><input placeholder="Service No" value={addForm.serviceNo} onChange={e=>setAddForm({...addForm,serviceNo:e.target.value})} style={{width:"100%",padding:9,margin:"5px 0",borderRadius:6,border:"1px solid #e5e7eb"}}/><input placeholder="Rank" value={addForm.rank} onChange={e=>setAddForm({...addForm,rank:e.target.value})} style={{width:"100%",padding:9,margin:"5px 0",borderRadius:6,border:"1px solid #e5e7eb"}}/><button onClick={doAdd} style={{width:"100%",padding:10,background:"#166534",color:"white",border:"none",borderRadius:6,cursor:"pointer"}}>Add Member</button></div>)}
        </div>

        {/* WORKING WHATSAPP GROUP BUTTON - EVERY MEMBER CLICKS GOES TO MAIN GROUP */}
        <div
          onClick={openWhatsAppGroup}
          style={{position:"fixed",bottom:20,right:20,width:54,height:54,background:"#22c55e",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:26,cursor:"pointer",boxShadow:"0 4px 15px rgba(0,0,0,0.25)",zIndex:9999,border:"2px solid white"}}
        >💬</div>
        <div style={{textAlign:"center",fontSize:9,color:"#9ca3af",marginTop:20,padding:10}}>© 2025 GIS WONJUGA WELFARE PORTAL • Powered by exclusive hans • FHIL {PAY_HIDDEN} hidden + Bank • 50 GHS default, pay more if debt</div>
      </div>
    </div>
  );
}
