import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// === WONJUGA WELFARE - FINAL CONFIG ===
const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/L5pezHIgjIS6J4uTVntugC";
const PAY_HIDDEN = "0559154973";
const OFFICIAL_COMMENCEMENT = new Date(2026, 10, 1); // Portal officially starts - CHANGE THIS DATE when portal starts officially
// Logic: 12 months payment = 100%, percentage base on months paid, points calculated by percentage

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
  const [loginForm,setLoginForm]=useState({serviceNo:"",password:""}); const [reqForm,setReqForm]=useState({serviceNo:"",phone:""});
  const [otp,setOtp]=useState(""); const [genOtp,setGenOtp]=useState(""); const [newPass,setNewPass]=useState("");
  const [addForm,setAddForm]=useState({fullName:"",phone:"",serviceNo:"",rank:""}); const [payAmount,setPayAmount]=useState(50);
  const [pic,setPic]=useState(localStorage.getItem("wonjuga_pic")||""); const [showPass,setShowPass]=useState(false);
  const [showConst,setShowConst]=useState(false);
  const [profileData,setProfileData]=useState({email:"",address:"",birthPlace:"",emergency:"",employment:""});
  const fileRef=useRef();

  useEffect(()=>{
    const a=onSnapshot(collection(db,"members"),s=>setMembers(s.docs.map(d=>({id:d.id,...d.data()}))));
    const b=onSnapshot(collection(db,"welfareRequests"),s=>setReqs(s.docs.map(d=>({id:d.id,...d.data()}))));
    const c=onSnapshot(collection(db,"announcements"),s=>setAnns(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{a();b();c();}
  },[]);

  const unique=members.filter((m,i,arr)=>arr.findIndex(x=>x.serviceNo===m.serviceNo)===i);
  const myDoc=unique.find(m=>m.serviceNo===user?.serviceNo);
  const myPaid=myDoc?.totalPaid||0;

  // === FRESH LOGIC - 19 CORRECTIONS IMPLEMENTED ===
  const paidMonths = Math.floor(myPaid/50); // 1 payment = 1 month
  const benefitPercent = Math.min(100, (paidMonths/12)*100); // 12 months = 100%
  const welfarePoints = Math.round((benefitPercent/100)*30); // Points calculated by percentage
  const maturityLevel = paidMonths>=6? `${benefitPercent.toFixed(0)}% Maturity` : "Not yet";
  const isEligible = paidMonths>=6;
  const memberSince = myDoc?.createdAt?.toDate? myDoc.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString();
  const portalActivated = OFFICIAL_COMMENCEMENT.toLocaleDateString('en-GH',{month:'long',year:'numeric'});
  const commencementMonth = OFFICIAL_COMMENCEMENT.toLocaleDateString('en-GH',{month:'long',year:'numeric'});

  // Contribution streak fresh from 0
  const currentStreak = paidMonths; // starts 0, auto updates
  const bestStreak = paidMonths; // auto updates

  // Profile completion auto update
  const profileFields = [myDoc?.fullName, myDoc?.phone, myDoc?.serviceNo, myDoc?.rank, profileData.email, profileData.address, profileData.birthPlace, profileData.emergency, profileData.employment, pic];
  const filledFields = profileFields.filter(f=>f&&f.length>0).length;
  const profilePercent = Math.round((filledFields/10)*100);

  const myReqs=reqs.filter(r=>r.serviceNo===user?.serviceNo);
  const openWhatsAppGroup=()=>window.open(WHATSAPP_GROUP_LINK,"_blank");

  // Login / OTP / Add / Upload / Pay
  const doLogin=async()=>{
    const q=query(collection(db,"members"),where("serviceNo","==",loginForm.serviceNo),where("password","==",loginForm.password));
    const snap=await getDocs(q); if(snap.empty) return alert("Wrong Service No or Password");
    const u=snap.docs[0].data(); localStorage.setItem("wonjuga_user",JSON.stringify(u)); localStorage.setItem("wonjuga_role",u.role||"member");
    setUser(u); setIsAdmin((u.role||"member")==="admin");
  };
  const doRequest=async()=>{
    const q=query(collection(db,"members"),where("serviceNo","==",reqForm.serviceNo)); const snap=await getDocs(q);
    if(snap.empty) return alert("Admin must first add Full Name, Phone, Service No");
    const code=Math.floor(100000+Math.random()*900000).toString(); setGenOtp(code);
    alert(`OTP to ${reqForm.phone}: ${code}`); setTab("otp");
  };
  const doVerify=()=>{ if(otp!==genOtp) return alert("Wrong OTP"); setTab("createPass"); };
  const doCreate=async()=>{
    const q=query(collection(db,"members"),where("serviceNo","==",reqForm.serviceNo)); const snap=await getDocs(q);
    await updateDoc(doc(db,"members",snap.docs[0].id),{password:newPass,phone:reqForm.phone,status:"Active"}); alert("Password created! Login"); setTab("login");
  };
  const doAdd=async()=>{
    if(!addForm.fullName||!addForm.serviceNo||!addForm.phone) return alert("Enter Full Name, Phone, Service No");
    if(unique.find(m=>m.serviceNo===addForm.serviceNo)) return alert("Service No exists");
    await addDoc(collection(db,"members"),{fullName:addForm.fullName,name:addForm.fullName,phone:addForm.phone,serviceNo:addForm.serviceNo,rank:addForm.rank,role:"member",totalPaid:0,status:"Active",createdAt:serverTimestamp()});
    alert("Added - Fresh start 0"); setAddForm({fullName:"",phone:"",serviceNo:"",rank:""});
  };
  const doUpload=async(e)=>{
    const file=e.target.files[0]; if(!file) return; const r=ref(storage,`profilePics/${user.serviceNo}`);
    await uploadBytes(r,file); const url=await getDownloadURL(r); localStorage.setItem("wonjuga_pic",url); setPic(url);
    const q=query(collection(db,"members"),where("serviceNo","==",user.serviceNo)); const snap=await getDocs(q);
    if(!snap.empty) await updateDoc(doc(db,"members",snap.docs[0].id),{photoURL:url});
  };
  const doPay=async()=>{
    const amt=Number(payAmount); if(amt<50) return alert("Min 50");
    const id=`GIS-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    await addDoc(collection(db,"welfareRequests"),{name:user.fullName,phone:user.phone,serviceNo:user.serviceNo,type:"Contribution",amount:amt,paymentId:id,status:"Pending",reason:`Payment ${id} of GHS ${amt}.00 recorded - FHIL ${PAY_HIDDEN}`,date:serverTimestamp()});
    const q=query(collection(db,"members"),where("serviceNo","==",user.serviceNo)); const snap=await getDocs(q);
    if(!snap.empty) await updateDoc(doc(db,"members",snap.docs[0].id),{totalPaid:(Number(snap.docs[0].data().totalPaid)||0)+amt});
    alert(`Paid GHS ${amt} - ${paidMonths+1} months = ${(((paidMonths+1)/12)*100).toFixed(0)}%`);
  };

  if(!user){
    return(
      <div style={{minHeight:"100vh",background:"#f5f7f5",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:20}}>
        <div style={{textAlign:"center",marginBottom:20}}><div style={{width:48,height:48,background:"#0f5c2e",borderRadius:8,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>🛡️</div><div style={{fontSize:10,letterSpacing:1,marginTop:6}}>GIS WONJUGA</div><div style={{fontWeight:700}}>Welfare Portal</div><div style={{fontSize:10,color:"#6b7280"}}>Official Welfare Management Platform</div></div>
        <div style={{background:"white",width:"100%",maxWidth:380,borderRadius:10,padding:24,border:"1px solid #e5e7eb"}}>
          {(tab==="login"||tab==="dashboard")&&(<><div style={{fontWeight:600,textAlign:"center"}}>Welcome Back</div><p style={{fontSize:11,color:"#6b7280",textAlign:"center"}}>Sign in to manage your welfare contributions</p><label style={{fontSize:11}}>Service Number</label><input placeholder="SU / 12954" value={loginForm.serviceNo} onChange={e=>setLoginForm({...loginForm,serviceNo:e.target.value})} style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #d1d5db",margin:"4px 0 10px"}}/><label style={{fontSize:11}}>Password</label><div style={{position:"relative"}}><input type={showPass?"text":"password"} placeholder="Enter your password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #d1d5db",margin:"4px 0"}}/><span onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:10,top:12,cursor:"pointer"}}>👁</span></div><button onClick={doLogin} style={{width:"100%",padding:10,background:"#0f5c2e",color:"white",border:"none",borderRadius:6,marginTop:10}}>Sign In</button><div style={{textAlign:"center",marginTop:10,fontSize:11}}><span style={{color:"#6b7280"}}>New member? </span><span onClick={()=>setTab("request")} style={{color:"#0f5c2e",fontWeight:600,cursor:"pointer"}}>Request Access</span></div></>)}
          {tab==="request"&&(<> <h4 style={{textAlign:"center"}}>Request Access</h4><input placeholder="Service Number" value={reqForm.serviceNo} onChange={e=>setReqForm({...reqForm,serviceNo:e.target.value})} style={{width:"100%",padding:10,margin:"6px 0",borderRadius:6,border:"1px solid #e2e8f0"}}/><input placeholder="Phone" value={reqForm.phone} onChange={e=>setReqForm({...reqForm,phone:e.target.value})} style={{width:"100%",padding:10,margin:"6px 0",borderRadius:6,border:"1px solid #e2e8f0"}}/><button onClick={doRequest} style={{width:"100%",padding:10,background:"#0f5c2e",color:"white",border:"none",borderRadius:6}}>Send OTP</button><button onClick={()=>setTab("login")} style={{width:"100%",padding:8,background:"#f1f5f9",border:"none",borderRadius:6,marginTop:8}}>Back</button></>)}
          {tab==="otp"&&(<> <h4>Enter OTP</h4><input value={otp} onChange={e=>setOtp(e.target.value)} style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #e2e8f0"}}/><button onClick={doVerify} style={{width:"100%",padding:10,background:"#0f5c2e",color:"white",border:"none",borderRadius:6,marginTop:10}}>Verify OTP</button></>)}
          {tab==="createPass"&&(<> <h4>Create Password</h4><input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #e2e8f0"}}/><button onClick={doCreate} style={{width:"100%",padding:10,background:"#0f5c2e",color:"white",border:"none",borderRadius:6,marginTop:10}}>Create & Login</button></>)}
        </div>
      </div>
    );
  }

  // Pie circle calculation
  const pieDash = `${(benefitPercent/100)*251} 251`;

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#f5f7f5",fontFamily:"Inter, sans-serif"}}>
      <div style={{width:200,background:"white",borderRight:"1px solid #e5e7eb",position:"sticky",top:0,height:"100vh"}}>
        <div style={{padding:"14px 12px",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,background:"#0f5c2e",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12}}>🛡️</div><div style={{fontSize:9,fontWeight:700,lineHeight:1.1}}>GIS WONJUGA<br/>Member Portal</div></div>
        <div style={{padding:8}}>
          <div onClick={()=>setTab("dashboard")} style={{padding:"9px 10px",borderRadius:6,cursor:"pointer",margin:"2px 0",background:tab==="dashboard"?"#0f5c2e":"transparent",color:tab==="dashboard"?"white":"#374151",fontSize:12}}>Dashboard</div>
          <div onClick={()=>setTab("profile")} style={{padding:"9px 10px",borderRadius:6,cursor:"pointer",margin:"2px 0",background:tab==="profile"?"#0f5c2e":"transparent",color:tab==="profile"?"white":"#374151",fontSize:12}}>My Profile</div>
          <div onClick={()=>setTab("welfare")} style={{padding:"9px 10px",borderRadius:6,cursor:"pointer",margin:"2px 0",background:tab==="welfare"?"#0f5c2e":"transparent",color:tab==="welfare"?"white":"#374151",fontSize:12}}>Welfare Support</div>
          <div onClick={()=>setTab("claims")} style={{padding:"9px 10px",borderRadius:6,cursor:"pointer",margin:"2px 0",background:tab==="claims"?"#0f5c2e":"transparent",color:tab==="claims"?"white":"#374151",fontSize:12}}>My Claims</div>
          <div onClick={()=>setTab("contributions")} style={{padding:"9px 10px",borderRadius:6,cursor:"pointer",margin:"2px 0",background:tab==="contributions"?"#0f5c2e":"transparent",color:tab==="contributions"?"white":"#374151",fontSize:12}}>Contributions</div>
          <div onClick={()=>setTab("announcements")} style={{padding:"9px 10px",borderRadius:6,cursor:"pointer",margin:"2px 0",background:tab==="announcements"?"#0f5c2e":"transparent",color:tab==="announcements"?"white":"#374151",fontSize:12}}>Announcements</div>
          <div onClick={()=>setTab("notifications")} style={{padding:"9px 10px",borderRadius:6,cursor:"pointer",margin:"2px 0",background:tab==="notifications"?"#0f5c2e":"transparent",color:tab==="notifications"?"white":"#374151",fontSize:12}}>Notifications {myReqs.length>0&&`(${myReqs.length})`}</div>
          {isAdmin&&<div onClick={()=>setTab("addMember")} style={{padding:"9px 10px",borderRadius:6,margin:"8px 0",background:"#eff6ff",color:"#1e40af",cursor:"pointer",fontSize:11}}>+ Add Member</div>}
        </div>
      </div>

      <div style={{flex:1}}>
        <div style={{background:"white",padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #e5e7eb"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><img src={pic||`https://ui-avatars.com/api/?name=${user.fullName}&background=0f5c2e&color=fff`} style={{width:28,height:28,borderRadius:"50%"}}/><div><div style={{fontSize:11,fontWeight:600}}>{user.fullName}</div><div style={{fontSize:9,color:"#6b7280"}}>{user.serviceNo}</div></div><div style={{marginLeft:12,background:"#fef9c3",color:"#854d0e",fontSize:9,padding:"4px 8px",borderRadius:4}}>Complete your profile to access all welfare services</div></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:11,cursor:"pointer"}} onClick={()=>setTab("notifications")}>🔔 Notifications</div><button onClick={()=>{localStorage.clear();location.reload();}} style={{background:"#dc2626",color:"white",border:"none",padding:"4px 10px",borderRadius:4,fontSize:11}}>Logout</button><button onClick={()=>setTab("profile")} style={{background:"#0f5c2e",color:"white",border:"none",padding:"4px 10px",borderRadius:4,fontSize:11}}>Complete Profile</button><img src={pic||`https://ui-avatars.com/api/?name=${user.fullName}&background=0f5c2e&color=fff`} onClick={()=>fileRef.current.click()} style={{width:30,height:30,borderRadius:"50%",cursor:"pointer"}}/><input type="file" ref={fileRef} onChange={doUpload} accept="image/*" style={{display:"none"}}/></div>
        </div>

        <div style={{padding:16,maxWidth:1050}}>
          {tab==="dashboard"&&(
            <>
              <div><h2 style={{margin:"0 0 2px",fontSize:15,fontWeight:600}}>Good Morning, {user.fullName?.split(" ")[0]} 👋</h2><div style={{fontSize:13,fontWeight:600}}>My Welfare Journey</div><div style={{fontSize:10,color:"#6b7280"}}>Welcome back, {user.fullName?.split(" ")[0]}<br/>Here's your welfare journey</div></div>

              {/* 1. BUILDING FOUNDATION - FIXED */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>🛡️ You're building your welfare foundation</div>
                <div style={{fontSize:11,marginTop:6,color:"#374151"}}>You have successfully completed <b>{paidMonths} of the required 6 contributions</b>. Only {Math.max(0,6-paidMonths)} more successful contributions to become eligible for welfare claims.</div>
                <div style={{fontSize:10,marginTop:4,color:"#6b7280"}}>Current Welfare Points: {welfarePoints} | 12 months = 100% benefit</div>
              </div>

              {/* 2. PROGRESS SUMMARY - FIXED MEMBERSHIP MATURITY */}
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginTop:12}}>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}>
                  <div style={{fontSize:11,fontWeight:600}}>Progress Summary</div>
                  <div style={{fontSize:9,color:"#6b7280"}}>Your current status from the Progression Engine</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10,fontSize:10}}>
                    <div>MEMBERSHIP STATUS<br/><b style={{fontSize:11}}>Active</b></div>
                    <div>MEMBERSHIP MATURITY<br/><b style={{color:isEligible?"#16a34a":"#6b7280"}}>{maturityLevel}</b></div>
                    <div>CLAIM ELIGIBILITY<br/><b>{isEligible?`${benefitPercent.toFixed(0)}% Eligible`:"Not yet"}</b></div>
                    <div>BENEFIT PERCENTAGE<br/><b>{benefitPercent.toFixed(1)}% ({paidMonths}/12 months)</b></div>
                    <div>PORTAL ACTIVATED<br/><b>{portalActivated} - Auto</b></div>
                    <div>MEMBER SINCE<br/><b>{memberSince} - Auto</b></div>
                  </div>
                </div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:10,textAlign:"left",fontWeight:600}}>Achievement Badge</div>
                  <div style={{fontSize:28,marginTop:12}}>🌱</div>
                  <div style={{fontSize:11,fontWeight:600,marginTop:6}}>Starter Member</div>
                  <div style={{fontSize:9,color:"#6b7280"}}>0-5 Welfare Points<br/>Keep going</div>
                  <div style={{marginTop:8,fontSize:10,background:"#f3f4f6",borderRadius:12,padding:"2px 8px",display:"inline-block"}}>{welfarePoints} / 30</div>
                </div>
              </div>

              {/* 4. WELFARE PROGRESS - WITH PIE CIRCLE + BAR */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:11,fontWeight:600}}>Welfare Progress</div>
                <div style={{fontSize:9,color:"#6b7280"}}>Benefit percentage and progress toward 30 Welfare Points - 12 months = 100%</div>
                <div style={{display:"flex",gap:20,marginTop:12,alignItems:"center"}}>
                  {/* PIE CIRCLE */}
                  <div style={{position:"relative",width:80,height:80}}>
                    <svg width="80" height="80" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#0f5c2e" strokeWidth="10" strokeDasharray={pieDash} transform="rotate(-90 50 50)" strokeLinecap="round"/>
                    </svg>
                    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:14,fontWeight:700}}>{benefitPercent.toFixed(0)}%</div>
                  </div>
                  <div>
                    <div style={{fontSize:10}}>Benefit Percentage: <b>{benefitPercent.toFixed(1)}%</b> based on {paidMonths} months paid</div>
                    <div style={{fontSize:10,marginTop:4}}>Welfare Points: <b>{welfarePoints}/30</b> calculated by percentage</div>
                    <div style={{fontSize:9,color:"#6b7280",marginTop:4}}>12 months payment = 100% benefit - {paidMonths} months = {benefitPercent.toFixed(0)}%</div>
                  </div>
                </div>
                {/* BAR */}
                <div style={{height:8,background:"#e5e7eb",borderRadius:4,marginTop:12}}><div style={{width:`${benefitPercent}%`,height:8,background:"#0f5c2e",borderRadius:4,transition:"width 0.5s"}}></div></div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:12,fontSize:10}}>
                  <div><div style={{fontWeight:600}}>Next Milestone - Auto Updated</div><div>Current<br/>{welfarePoints} Points<br/>{benefitPercent.toFixed(0)}%</div><div style={{marginTop:6}}>Next: {paidMonths<6?`Membership Maturity - ${6-paidMonths} more needed`:`${Math.min(12,paidMonths+2)} months = ${Math.min(100,((paidMonths+2)/12)*100).toFixed(0)}%`}</div></div>
                  <div><div style={{fontWeight:600}}>Benefit Levels - Auto</div><div style={{fontSize:9,color:"#6b7280"}}>6 months = {(6/12*100).toFixed(0)}% - Eligible for claims<br/>8 months = {(8/12*100).toFixed(0)}%<br/>12 months = 100% Maximum</div></div>
                  <div><div style={{fontWeight:600}}>Contribution Streak - Fresh from 0, Auto</div><div style={{display:"flex",gap:16,marginTop:4}}><div><div style={{fontSize:16,fontWeight:700}}>{currentStreak}</div><div style={{fontSize:8}}>CURRENT STREAK<br/>Months - Fresh 0</div></div><div><div style={{fontSize:16,fontWeight:700}}>{bestStreak}</div><div style={{fontSize:8}}>BEST STREAK<br/>Months - Auto</div></div></div></div>
                </div>
              </div>

              {/* 6. CONTRIBUTION STATISTICS - ALL FROM 0 AUTO */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginTop:12}}>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:10,fontWeight:600}}>Contribution Statistics - Auto from 0</div><div style={{fontSize:20,fontWeight:700,marginTop:6}}>{paidMonths}</div><div style={{fontSize:9,color:"#6b7280"}}>SUCCESSFUL CONTRIBUTIONS<br/>Fresh start 0 - Auto updates</div></div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:20,fontWeight:700}}>{myReqs.filter(r=>new Date(r.date?.toDate?.()||Date.now()).getFullYear()===new Date().getFullYear()).length}</div><div style={{fontSize:9,color:"#6b7280"}}>CONTRIBUTED THIS YEAR<br/>Auto from {OFFICIAL_COMMENCEMENT.getFullYear()}</div></div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:20,fontWeight:700}}>{paidMonths>0?0:1}</div><div style={{fontSize:9,color:"#6b7280"}}>OUTSTANDING<br/>Auto - Starts 0</div></div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:600}}>Active</div><div style={{fontSize:9,color:"#6b7280"}}>SYSTEM STATUS<br/>Auto updates</div></div>
              </div>

              {/* 7. OUTSTANDING - MONTH FROM PORTAL OFFICIALLY */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:11,fontWeight:600}}>Outstanding Contributions</div>
                <div style={{fontSize:9,color:"#6b7280"}}>Keep your account active by staying up to date. Month starts from {commencementMonth} official portal start.</div>
                <div style={{marginTop:8,background:"#f9fafb",border:"1px solid #f3f4f6",borderRadius:6,padding:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:10,fontWeight:600}}>{commencementMonth} - Portal Official Start</div><div style={{fontSize:9,color:"#6b7280"}}>GHS 50.00 - Default, pay more if debt - Auto from official month</div></div>
                  <button onClick={()=>setTab("contributions")} style={{padding:"6px 12px",background:"#0f5c2e",color:"white",border:"none",borderRadius:4,fontSize:10,cursor:"pointer"}}>Pay Now</button>
                </div>
              </div>

              {/* 8. ESTIMATED CLAIM - REMOVED FRESH WONJUGA */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:11,fontWeight:600}}>Estimated Claim Benefits</div>
                <div style={{fontSize:9,color:"#6b7280",marginTop:4}}>Benefit estimate based on current welfare percentage and maximum benefit. This is not a guarantee of payout. Actual benefit depends on available funds and eligibility verification at claim time.</div>
                <div style={{fontSize:10,marginTop:8}}>Current estimated benefit: <b>GHS {isEligible? (benefitPercent/100*5000).toFixed(2) : 0}.00</b> {isEligible?`at ${benefitPercent.toFixed(0)}% for ${paidMonths} months`:"(Become eligible after 6 contributions)"}</div>
              </div>

              {/* 9. WELFARE JOURNEY TIMELINE - AUTO DEPENDING WHEN MEMBER JOINS */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:11,fontWeight:600}}>Welfare Journey Timeline - Auto Updated by Join Date</div>
                <div style={{marginTop:8,fontSize:10}}>
                  <div style={{display:"flex",gap:8,padding:"6px 0"}}><span style={{color:"#16a34a"}}>✓</span> Joined WONJUGA Welfare Scheme<br/>{memberSince} - Member since auto</div>
                  <div style={{display:"flex",gap:8,padding:"6px 0"}}><span style={{color:paidMonths>=1?"#16a34a":"#d1d5db"}}>{paidMonths>=1?"✓":"○"}</span> First Contribution - {myReqs[0]? new Date(myReqs[0].date?.toDate?.()||Date.now()).toLocaleDateString() : "Not yet - Auto updates when you pay"}</div>
                  <div style={{display:"flex",gap:8,padding:"6px 0"}}><span style={{color:paidMonths>=6?"#16a34a":"#d1d5db"}}>{paidMonths>=6?"✓":"○"}</span> Membership Maturity (6 months) - {paidMonths>=6?`${benefitPercent.toFixed(0)}% Achieved`:`${6-paidMonths} more needed - Auto`}</div>
                  <div style={{display:"flex",gap:8,padding:"6px 0"}}><span style={{color:paidMonths>=8?"#16a34a":"#d1d5db"}}>{paidMonths>=8?"✓":"○"}</span> Reached 66% Benefit (8 months)</div>
                  <div style={{display:"flex",gap:8,padding:"6px 0"}}><span style={{color:paidMonths>=12?"#16a34a":"#d1d5db"}}>{paidMonths>=12?"✓":"○"}</span> Reached Maximum Benefit (12 months = 100%)</div>
                  <div style={{fontSize:9,color:"#6b7280",marginTop:6}}>Next milestone auto: {paidMonths<6?`Membership Maturity - ${6-paidMonths} more` : paidMonths<12?`${12-paidMonths} more to 100%` : "Maximum achieved"}</div>
                </div>
              </div>

              <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:10,marginTop:12,fontSize:10}}>
                <div style={{fontWeight:600}}>Active — good standing</div>
                <div style={{color:"#166534",marginTop:2}}>You are in good standing with the welfare scheme. Keep making your regular monthly contributions to grow your Welfare Points and benefit percentage. {paidMonths} months = {benefitPercent.toFixed(0)}%</div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
                {/* 10. RECENT CLAIMS WITH VIEW ALL LINKING TO MY CLAIMS */}
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontSize:11,fontWeight:600}}>Recent Claims</div><span onClick={()=>setTab("claims")} style={{fontSize:10,color:"#0f5c2e",cursor:"pointer",fontWeight:600}}>View All →</span></div>
                  <div style={{fontSize:9,color:"#6b7280"}}>Your latest welfare claims</div>
                  <div style={{fontSize:10,marginTop:8,color:"#6b7280"}}>You haven't submitted any claims yet.<br/>Once you're eligible ({paidMonths}/6), your submitted claims will appear here.</div>
                  <button onClick={()=>setTab("claims")} style={{marginTop:8,padding:"5px 10px",background:"#0f5c2e",color:"white",border:"none",borderRadius:4,fontSize:9,cursor:"pointer"}}>Go to My Claims</button>
                </div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:600}}>Why Consistency Matters</div><div style={{fontSize:9,marginTop:6,color:"#374151"}}>Regular contributions help increase Welfare Points, improve benefit percentage and strengthen your protection. Every contribution counts. 12 months payment gives you 100% benefit.</div><div style={{fontSize:9,marginTop:8,color:"#6b7280"}}>Thank you for being part of GIS WONJUGA Welfare. Every consistent contribution builds a stronger future for you and your peers.</div></div>
              </div>

              {/* 12. OFFICIAL WELFARE CONSTITUTION - PROPER ARRANGEMENT */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>Official Welfare Constitution</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,background:"#f9fafb",padding:10,borderRadius:6}}>
                  <div><div style={{fontSize:8,color:"#6b7280",fontWeight:600}}>DOCUMENT</div><div style={{fontSize:10,marginTop:2,fontWeight:600}}>GIS WONJUGA WELFARE Constitution</div><div style={{fontSize:8,color:"#6b7280"}}>Official WONJUGA WELFARE Constitution</div></div>
                  <div><div style={{fontSize:8,color:"#6b7280",fontWeight:600}}>VERSION</div><div style={{fontSize:10,marginTop:2,fontWeight:600}}>1.0</div><div style={{fontSize:8,color:"#6b7280"}}>Official Constitution</div></div>
                  <div><div style={{fontSize:8,color:"#6b7280",fontWeight:600}}>EFFECTIVE DATE</div><div style={{fontSize:10,marginTop:2,fontWeight:600}}>{OFFICIAL_COMMENCEMENT.toLocaleDateString('en-GH',{day:'2-digit',month:'long',year:'numeric'})}</div><div style={{fontSize:8,color:"#6b7280"}}>Date constitution governs scheme - Auto</div></div>
                  <div><div style={{fontSize:8,color:"#6b7280",fontWeight:600}}>STATUS</div><div style={{fontSize:10,marginTop:2,fontWeight:600,color:"#16a34a"}}>Active</div><div style={{fontSize:8,color:"#6b7280"}}>Constitution</div></div>
                </div>
                <div style={{marginTop:10,fontSize:9}}><b>This document governs the Welfare Scheme including:</b><br/>• Membership • Contributions • Claims Administration • Executive Administration<br/>All members are encouraged to read and understand the constitution before participating.</div>
                <div style={{display:"flex",gap:8,marginTop:10}}><button onClick={()=>setShowConst(true)} style={{padding:"6px 12px",background:"#0f5c2e",color:"white",border:"none",borderRadius:4,fontSize:10,cursor:"pointer"}}>View Constitution</button><button onClick={()=>setShowConst(true)} style={{padding:"6px 12px",background:"white",border:"1px solid #e5e7eb",borderRadius:4,fontSize:10,cursor:"pointer"}}>Download Constitution</button></div>
              </div>

              {/* 13. MEMBER OVERVIEW - ALL TABS WORKING */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:11,fontWeight:600}}>Member Overview</div>
                <div style={{fontSize:9,color:"#6b7280"}}>Current dues, payments, and welfare support at a glance</div>
                <div style={{fontSize:11,fontWeight:600,marginTop:10}}>My Membership Status</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:8,marginTop:6,fontSize:9,background:"#f9fafb",padding:8,borderRadius:6}}>
                  <div>CURRENT MONTH<br/><b>{new Date().toLocaleDateString('en-GH',{month:'long',year:'numeric'})}<br/>{myPaid>0?"Paid":"Not paid"}</b></div>
                  <div>LAST PAYMENT<br/><b>{myReqs[0]?`GHS ${myReqs[0].amount} on ${new Date(myReqs[0].date?.toDate?.()||Date.now()).toLocaleDateString()}`:"None"}</b></div>
                  <div>TOTAL PAID<br/><b>{paidMonths} months<br/>GHS {myPaid}.00</b></div>
                  <div>LAST RECEIPT<br/><b>{myReqs[0]?new Date(myReqs[0].date?.toDate?.()||Date.now()).toLocaleDateString():"--"}</b></div>
                  <div>MEMBER SUMMARY<br/><b>Profile Details<br/>View below</b></div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <button onClick={()=>setTab("contributions")} style={{padding:"5px 10px",background:"black",color:"white",border:"none",borderRadius:4,fontSize:9,cursor:"pointer"}}>My Contributions</button>
                  <button onClick={()=>setTab("contributions")} style={{padding:"5px 10px",background:"white",border:"1px solid #e5e7eb",borderRadius:4,fontSize:9,cursor:"pointer"}}>Payment History</button>
                  <button onClick={()=>setTab("welfare")} style={{padding:"5px 10px",background:"white",border:"1px solid #e5e7eb",borderRadius:4,fontSize:9,cursor:"pointer"}}>Welfare Support</button>
                  <button onClick={()=>setTab("contributions")} style={{padding:"5px 10px",background:"white",border:"1px solid #e5e7eb",borderRadius:4,fontSize:9,cursor:"pointer"}}>Receipts</button>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
                {/* 14. PROFILE COMPLETION AUTO */}
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}>
                  <div style={{fontSize:11,fontWeight:600}}>Profile Completion - {profilePercent}% Auto</div>
                  <div style={{height:6,background:"#e5e7eb",borderRadius:4,marginTop:6}}><div style={{width:`${profilePercent}%`,height:6,background:"#0f5c2e",borderRadius:4}}></div></div>
                  <div style={{fontSize:9,marginTop:6}}>Complete your profile to unlock all welfare services - Auto updates</div>
                  <div style={{fontSize:9,marginTop:6}}><b>Missing:</b><br/>{!profileData.email&&"• Email\n"}{!profileData.address&&"• Address\n"}{!profileData.birthPlace&&"• Place of Birth\n"}{!profileData.emergency&&"• Emergency Contact\n"}{!profileData.employment&&"• Employment Information\n"}{profilePercent===100&&"All complete!"}</div>
                  <button onClick={()=>setTab("profile")} style={{marginTop:8,padding:"6px 10px",background:"black",color:"white",border:"none",borderRadius:4,fontSize:9,cursor:"pointer"}}>Complete Profile</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {/* 16. MEMBER SUMMARY = MY PROFILE DETAILS */}
                  <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}>
                    <div style={{fontSize:11,fontWeight:600}}>Member Summary - My Profile Details</div>
                    <div style={{fontSize:9,marginTop:4}}>
                      Full Name: <b>{user.fullName}</b><br/>
                      Service No: <b>{user.serviceNo}</b><br/>
                      Rank: <b>{myDoc?.rank||"Not set"}</b><br/>
                      Phone: <b>{myDoc?.phone}</b><br/>
                      TOTAL PAID: <b>{paidMonths} months | GHS {myPaid}.00</b><br/>
                      Member Since: <b>{memberSince}</b><br/>
                      Status: <b>Active</b>
                    </div>
                  </div>
                  {/* 17 & 18 ANNOUNCEMENT AUTO */}
                  <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}>
                    <div style={{fontSize:11,fontWeight:600}}>Announcements - {anns.length} - Auto</div>
                    <div style={{fontSize:9,color:"#6b7280",marginTop:4}}>{anns.length===0?"No announcements available for you - Latest announcements auto updated":anns[0]?.title}</div>
                    {anns.slice(0,2).map(a=><div key={a.id} style={{fontSize:9,marginTop:6,padding:6,background:"#f9fafb",borderRadius:4}}><b>{a.title}</b><br/>{a.message?.slice(0,60)}</div>)}
                  </div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:600}}>Recent Welfare History</div><div style={{fontSize:9,color:"#6b7280"}}>Latest welfare assistance and paid benefits - Auto</div><div style={{fontSize:9,marginTop:8}}>{myReqs.filter(r=>r.status==="Approved").length===0?"No welfare assistance or paid benefits yet - Auto updates":`Approved: ${myReqs.filter(r=>r.status==="Approved").length}`}</div></div>
                {/* 19 MY CONTRIBUTIONS FRESH AUTO */}
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:600}}>My Contributions - Fresh 0 Auto Updated</div><div style={{fontSize:9,color:"#6b7280"}}>Total contributions - Your payment summary - Auto from 0</div><div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:10}}><div>Total<br/>contributions<br/><b>{paidMonths} - Auto from 0</b></div><div>Total amount paid<br/><b>GHS {myPaid}.00<br/>Auto</b></div><div>Last<br/>Contribution<br/><b>{myReqs[0]?new Date(myReqs[0].date?.toDate?.()||Date.now()).toLocaleDateString('en-GH',{day:'2-digit',month:'short',year:'numeric'}):"Fresh start"}</b></div></div><button onClick={()=>setTab("contributions")} style={{marginTop:8,padding:"5px 10px",background:"black",color:"white",border:"none",borderRadius:4,fontSize:9,cursor:"pointer"}}>View Contributions</button></div>
              </div>
            </>
          )}

          {tab==="contributions"&&(
            <div><h3>Contributions - Fresh Auto - 12 months = 100% - {commencementMonth} start</h3><div style={{background:"white",padding:14,borderRadius:8,border:"1px solid #e5e7eb"}}><div>{new Date().toLocaleDateString('en-GH',{month:'long',year:'numeric'})} - GHS 50.00 - Fresh from {commencementMonth}</div><input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)} style={{padding:8,borderRadius:6,border:"1px solid #d1d5db",width:120,marginTop:8}}/><button onClick={doPay} style={{marginLeft:8,padding:"8px 14px",background:"#0f5c2e",color:"white",border:"none",borderRadius:6,cursor:"pointer"}}>Pay GHS {payAmount}</button><div style={{marginTop:12,fontSize:12}}>Months Paid: {paidMonths}/12 = {benefitPercent.toFixed(1)}% - Points: {welfarePoints}/30 - Auto calculated - Fresh</div><div style={{marginTop:8}}>{myReqs.map(r=><div key={r.id} style={{fontSize:10,padding:4,borderBottom:"1px solid #f3f4f6"}}>{r.paymentId} - GHS {r.amount} - {new Date(r.date?.toDate?.()||Date.now()).toLocaleDateString()} - {r.status}</div>)}</div></div></div>
          )}
          {tab==="profile"&&(
            <div style={{background:"white",padding:16,borderRadius:8,border:"1px solid #e5e7eb"}}>
              <h3>My Profile - {profilePercent}% Complete - Auto</h3>
              <img src={pic||`https://ui-avatars.com/api/?name=${user.fullName}&background=0f5c2e&color=fff`} style={{width:80,height:80,borderRadius:"50%"}}/>
              <button onClick={()=>fileRef.current.click()} style={{marginLeft:10,padding:"6px 10px",background:"black",color:"white",border:"none",borderRadius:4,cursor:"pointer"}}>Change Photo</button>
              <div style={{marginTop:12,fontSize:11}}>
                <div>Full Name: {user.fullName}</div>
                <div>Service No: {user.serviceNo}</div>
                <div>Total Paid: {paidMonths} months = GHS {myPaid} = {benefitPercent.toFixed(0)}%</div>
                <div>Member Since: {memberSince} - Auto</div>
                <div>Portal Activated: {portalActivated} - Auto</div>
                <div>Welfare Points: {welfarePoints}/30 - Auto by percentage</div>
              </div>
              <div style={{marginTop:12,display:"grid",gap:8}}>
                <input placeholder="Email" value={profileData.email} onChange={e=>setProfileData({...profileData,email:e.target.value})} style={{padding:8,borderRadius:6,border:"1px solid #e5e7eb"}}/>
                <input placeholder="Address" value={profileData.address} onChange={e=>setProfileData({...profileData,address:e.target.value})} style={{padding:8,borderRadius:6,border:"1px solid #e5e7eb"}}/>
                <input placeholder="Place of Birth" value={profileData.birthPlace} onChange={e=>setProfileData({...profileData,birthPlace:e.target.value})} style={{padding:8,borderRadius:6,border:"1px solid #e5e7eb"}}/>
                <input placeholder="Emergency Contact" value={profileData.emergency} onChange={e=>setProfileData({...profileData,emergency:e.target.value})} style={{padding:8,borderRadius:6,border:"1px solid #e5e7eb"}}/>
                <input placeholder="Employment Information" value={profileData.employment} onChange={e=>setProfileData({...profileData,employment:e.target.value})} style={{padding:8,borderRadius:6,border:"1px solid #e5e7eb"}}/>
                <button onClick={async()=>{ const q=query(collection(db,"members"),where("serviceNo","==",user.serviceNo)); const snap=await getDocs(q); if(!snap.empty) await updateDoc(doc(db,"members",snap.docs[0].id),{...profileData}); alert(`Profile updated - ${profilePercent}% complete - Auto`); }} style={{padding:8,background:"#0f5c2e",color:"white",border:"none",borderRadius:6}}>Save Profile - Auto updates {profilePercent}%</button>
              </div>
            </div>
          )}
          {tab==="claims"&&(<div style={{background:"white",padding:14,borderRadius:8,border:"1px solid #e5e7eb"}}><h3>My Claims - Linked from Recent Claims View All - Auto</h3><p style={{fontSize:11}}>Eligibility: {paidMonths}/6 months = {benefitPercent.toFixed(0)}% - {isEligible?"Eligible":"Not yet - need 6 months"}</p>{["My Drafts (0)","Needs Revision (0)","Submitted (0)","Under Review (0)","Decided (0)"].map(t=><div key={t} style={{padding:12,border:"1px solid #f3f4f6",borderRadius:6,marginTop:8}}>{t}</div>)}</div>)}
          {tab==="announcements"&&(<div style={{background:"white",padding:20,borderRadius:8,border:"1px solid #e5e7eb"}}><h3>Latest Announcements - Auto Updated</h3>{anns.length===0?<p>No announcements yet - Auto updates when admin posts</p>:anns.map(a=><div key={a.id} style={{padding:10,border:"1px solid #f3f4f6",borderRadius:6,marginTop:8}}><b>{a.title}</b><p style={{fontSize:11}}>{a.message}</p><div style={{fontSize:9,color:"#6b7280"}}>{a.date?.toDate?.().toLocaleString()||"Recent"}</div></div>)}<button onClick={openWhatsAppGroup} style={{marginTop:12,padding:"8px 14px",background:"#22c55e",color:"white",border:"none",borderRadius:6,cursor:"pointer"}}>Join WhatsApp Group</button></div>)}
          {tab==="addMember"&&isAdmin&&(<div style={{background:"white",padding:14,borderRadius:8,border:"1px solid #e5e7eb"}}><h3>Add Member - Fresh 0 Auto</h3><input placeholder="Full Name" value={addForm.fullName} onChange={e=>setAddForm({...addForm,fullName:e.target.value})} style={{width:"100%",padding:9,margin:"5px 0",borderRadius:6,border:"1px solid #e5e7eb"}}/><input placeholder="Phone" value={addForm.phone} onChange={e=>setAddForm({...addForm,phone:e.target.value})} style={{width:"100%",padding:9,margin:"5px 0",borderRadius:6,border:"1px solid #e5e7eb"}}/><input placeholder="Service No" value={addForm.serviceNo} onChange={e=>setAddForm({...addForm,serviceNo:e.target.value})} style={{width:"100%",padding:9,margin:"5px 0",borderRadius:6,border:"1px solid #e5e7eb"}}/><input placeholder="Rank" value={addForm.rank} onChange={e=>setAddForm({...addForm,rank:e.target.value})} style={{width:"100%",padding:9,margin:"5px 0",borderRadius:6,border:"1px solid #e5e7eb"}}/><button onClick={doAdd} style={{width:"100%",padding:10,background:"#0f5c2e",color:"white",border:"none",borderRadius:6,cursor:"pointer"}}>Add Member - Fresh 0 months = 0% - Auto</button></div>)}
        </div>

        {showConst&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowConst(false)}>
            <div style={{background:"white",width:"100%",maxWidth:900,height:"90vh",borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
              <div style={{padding:"12px 16px",background:"#0f5c2e",color:"white",display:"flex",justifyContent:"space-between"}}><div><b>WONJUGA WELFARE CONSTITUTION</b><div style={{fontSize:10}}>Version 1.0 - Effective {OFFICIAL_COMMENCEMENT.toLocaleDateString()} - Auto arranged</div></div><button onClick={()=>setShowConst(false)} style={{background:"#dc2626",color:"white",border:"none",borderRadius:4,padding:"4px 10px",cursor:"pointer"}}>Close X</button></div>
              <iframe src="/constitution_v1.pdf" style={{width:"100%",height:"100%",border:"none"}} title="Constitution"></iframe>
            </div>
          </div>
        )}

        <div onClick={openWhatsAppGroup} style={{position:"fixed",bottom:20,right:20,width:52,height:52,background:"#22c55e",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:22,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.2)",zIndex:9999}}>💬</div>
        <div style={{textAlign:"center",fontSize:8,color:"#9ca3af",marginTop:20,padding:10}}>© 2025 GIS WONJUGA WELFARE PORTAL • Powered by exclusive hans • {commencementMonth} Official Start • {paidMonths}/12 months = {benefitPercent.toFixed(0)}% • Points {welfarePoints}/30 auto</div>
      </div>
    </div>
  );
}
