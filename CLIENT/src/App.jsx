import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/YOUR-WONJUGA-GROUP-LINK-HERE";
const PAY_HIDDEN = "0559154973";
const OFFICIAL_COMMENCEMENT = new Date(2026, 9, 1); // CHANGE THIS when welfare officially commences

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
  const [members,setMembers]=useState([]); const [reqs,setReqs]=useState([]);
  const [loginForm,setLoginForm]=useState({serviceNo:"",password:""}); const [reqForm,setReqForm]=useState({serviceNo:"",phone:""});
  const [otp,setOtp]=useState(""); const [genOtp,setGenOtp]=useState(""); const [newPass,setNewPass]=useState("");
  const [addForm,setAddForm]=useState({fullName:"",phone:"",serviceNo:"",rank:""}); const [payAmount,setPayAmount]=useState(50);
  const [pic,setPic]=useState(localStorage.getItem("wonjuga_pic")||""); const [showPass,setShowPass]=useState(false);
  const [showConst,setShowConst]=useState(false);
  const fileRef=useRef();

  useEffect(()=>{
    const a=onSnapshot(collection(db,"members"),s=>setMembers(s.docs.map(d=>({id:d.id,...d.data()}))));
    const b=onSnapshot(collection(db,"welfareRequests"),s=>setReqs(s.docs.map(d=>({id:d.id,...d.data()}))));
    return()=>{a();b();}
  },[]);

  const unique=members.filter((m,i,arr)=>arr.findIndex(x=>x.serviceNo===m.serviceNo)===i);
  const myData=unique.filter(m=>m.serviceNo===user?.serviceNo);
  const myPaid=myData[0]?.totalPaid||0;
  const welfarePoints = Math.floor(myPaid/50); // FRESH START - 0 at beginning
  const welfarePercent = Math.min(100, (welfarePoints/30)*100);
  const myReqs=reqs.filter(r=>r.serviceNo===user?.serviceNo);

  const openWhatsAppGroup=()=>{
    if(WHATSAPP_GROUP_LINK.includes("YOUR-WONJUGA")) return alert("WhatsApp Group link not added yet - Admin will add soon");
    window.open(WHATSAPP_GROUP_LINK,"_blank");
  };

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
    await addDoc(collection(db,"members"),{fullName:addForm.fullName,name:addForm.fullName,phone:addForm.phone,serviceNo:addForm.serviceNo,rank:addForm.rank,role:"member",totalPaid:0,status:"Pending",createdAt:serverTimestamp()});
    alert("Added - Fresh start 0 GHS"); setAddForm({fullName:"",phone:"",serviceNo:"",rank:""});
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
    await addDoc(collection(db,"welfareRequests"),{name:user.fullName,phone:user.phone,serviceNo:user.serviceNo,type:"Contribution",amount:amt,paymentId:id,status:"Pending",reason:`Payment ${id} of GHS ${amt}.00 recorded - FHIL ${PAY_HIDDEN} hidden`,date:serverTimestamp()});
    const q=query(collection(db,"members"),where("serviceNo","==",user.serviceNo)); const snap=await getDocs(q);
    if(!snap.empty) await updateDoc(doc(db,"members",snap.docs[0].id),{totalPaid:(Number(snap.docs[0].data().totalPaid)||0)+amt});
    alert(`Paid GHS ${amt} - Fresh WONJUGA count - Points now ${Math.floor(((myPaid+amt)/50))}`);
  };

  if(!user){
    return(
      <div style={{minHeight:"100vh",background:"#f5f7f5",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:20}}>
        <div style={{textAlign:"center",marginBottom:20}}><div style={{width:48,height:48,background:"#0f5c2e",borderRadius:8,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>🛡️</div><div style={{fontSize:10,letterSpacing:1,marginTop:6}}>GIS WONJUGA</div><div style={{fontWeight:700}}>Welfare Portal</div><div style={{fontSize:10,color:"#6b7280"}}>Official Welfare Management Platform</div></div>
        <div style={{background:"white",width:"100%",maxWidth:380,borderRadius:10,padding:24,border:"1px solid #e5e7eb"}}>
          {(tab==="login"||tab==="dashboard")&&(<><div style={{fontWeight:600,textAlign:"center"}}>Welcome Back</div><p style={{fontSize:11,color:"#6b7280",textAlign:"center"}}>Sign in to manage your welfare contributions</p><label style={{fontSize:11}}>Service Number</label><input placeholder="SU / 12954" value={loginForm.serviceNo} onChange={e=>setLoginForm({...loginForm,serviceNo:e.target.value})} style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #d1d5db",margin:"4px 0 10px"}}/><label style={{fontSize:11}}>Password</label><div style={{position:"relative"}}><input type={showPass?"text":"password"} placeholder="Enter your password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #d1d5db",margin:"4px 0"}}/><span onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:10,top:12,cursor:"pointer"}}>👁</span></div><div style={{fontSize:9,color:"#9ca3af",marginBottom:12}}>Minimum 8 characters</div><button onClick={doLogin} style={{width:"100%",padding:10,background:"#0f5c2e",color:"white",border:"none",borderRadius:6}}>Sign In</button><div style={{textAlign:"center",fontSize:10,color:"#9ca3af",marginTop:8}}>Version 1.7.5</div><div style={{textAlign:"center",marginTop:10,fontSize:11}}><span style={{color:"#6b7280"}}>New member? </span><span onClick={()=>setTab("request")} style={{color:"#0f5c2e",fontWeight:600,cursor:"pointer"}}>Request Access</span></div><div style={{textAlign:"center",marginTop:6,fontSize:10,color:"#6b7280"}}><span onClick={()=>setTab("request")} style={{cursor:"pointer"}}>Activate Account</span> - <span onClick={()=>setTab("request")} style={{cursor:"pointer"}}>Forgot Password</span></div></>)}
          {tab==="request"&&(<> <h4 style={{textAlign:"center"}}>Request Access</h4><input placeholder="Service Number" value={reqForm.serviceNo} onChange={e=>setReqForm({...reqForm,serviceNo:e.target.value})} style={{width:"100%",padding:10,margin:"6px 0",borderRadius:6,border:"1px solid #e2e8f0"}}/><input placeholder="Phone" value={reqForm.phone} onChange={e=>setReqForm({...reqForm,phone:e.target.value})} style={{width:"100%",padding:10,margin:"6px 0",borderRadius:6,border:"1px solid #e2e8f0"}}/><button onClick={doRequest} style={{width:"100%",padding:10,background:"#0f5c2e",color:"white",border:"none",borderRadius:6}}>Send OTP</button><button onClick={()=>setTab("login")} style={{width:"100%",padding:8,background:"#f1f5f9",border:"none",borderRadius:6,marginTop:8}}>Back</button></>)}
          {tab==="otp"&&(<> <h4>Enter OTP</h4><input value={otp} onChange={e=>setOtp(e.target.value)} style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #e2e8f0"}}/><button onClick={doVerify} style={{width:"100%",padding:10,background:"#0f5c2e",color:"white",border:"none",borderRadius:6,marginTop:10}}>Verify OTP</button></>)}
          {tab==="createPass"&&(<> <h4>Create Password</h4><input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #e2e8f0"}}/><button onClick={doCreate} style={{width:"100%",padding:10,background:"#0f5c2e",color:"white",border:"none",borderRadius:6,marginTop:10}}>Create & Login</button></>)}
        </div>
        <div style={{textAlign:"center",fontSize:9,color:"#9ca3af",marginTop:12}}>© 2025 GIS WONJUGA WELFARE PORTAL • Powered by exclusive hans</div>
      </div>
    );
  }

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#f5f7f5",fontFamily:"Inter, sans-serif"}}>
      {/* LEFT SIDEBAR EXACT LIKE VIDEO */}
      <div style={{width:200,background:"white",borderRight:"1px solid #e5e7eb",position:"sticky",top:0,height:"100vh"}}>
        <div style={{padding:"14px 12px",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,background:"#0f5c2e",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12}}>🛡️</div><div style={{fontSize:9,fontWeight:700,lineHeight:1.1}}>GIS WONJUGA 28<br/>Member Portal</div></div>
        <div style={{padding:8}}>
          <div onClick={()=>setTab("dashboard")} style={{padding:"9px 10px",borderRadius:6,cursor:"pointer",margin:"2px 0",background:tab==="dashboard"?"#0f5c2e":"transparent",color:tab==="dashboard"?"white":"#374151",fontSize:12}}>Dashboard</div>
          <div onClick={()=>setTab("profile")} style={{padding:"9px 10px",borderRadius:6,cursor:"pointer",margin:"2px 0",background:tab==="profile"?"#0f5c2e":"transparent",color:tab==="profile"?"white":"#374151",fontSize:12}}>My Profile</div>
          <div onClick={()=>setTab("welfare")} style={{padding:"9px 10px",borderRadius:6,cursor:"pointer",margin:"2px 0",background:tab==="welfare"?"#0f5c2e":"transparent",color:tab==="welfare"?"white":"#374151",fontSize:12}}>Welfare Support</div>
          <div onClick={()=>setTab("claims")} style={{padding:"9px 10px",borderRadius:6,cursor:"pointer",margin:"2px 0",background:tab==="claims"?"#0f5c2e":"transparent",color:tab==="claims"?"white":"#374151",fontSize:12}}>My Claims</div>
          <div onClick={()=>setTab("contributions")} style={{padding:"9px 10px",borderRadius:6,cursor:"pointer",margin:"2px 0",background:tab==="contributions"?"#0f5c2e":"transparent",color:tab==="contributions"?"white":"#374151",fontSize:12}}>Contributions</div>
          <div style={{padding:"9px 10px",borderRadius:6,margin:"2px 0",color:"#374151",fontSize:12,cursor:"pointer"}}>Announcements</div>
          <div style={{padding:"9px 10px",borderRadius:6,margin:"2px 0",color:"#374151",fontSize:12,cursor:"pointer"}}>Notifications</div>
          {isAdmin&&<div onClick={()=>setTab("addMember")} style={{padding:"9px 10px",borderRadius:6,margin:"8px 0",background:"#eff6ff",color:"#1e40af",cursor:"pointer",fontSize:11}}>+ Add Member</div>}
        </div>
      </div>

      <div style={{flex:1}}>
        {/* TOP BAR EXACT LIKE VIDEO */}
        <div style={{background:"white",padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #e5e7eb"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><img src={pic||`https://ui-avatars.com/api/?name=${user.fullName}&background=0f5c2e&color=fff`} style={{width:28,height:28,borderRadius:"50%"}}/><div><div style={{fontSize:11,fontWeight:600}}>{user.fullName}</div><div style={{fontSize:9,color:"#6b7280"}}>{user.serviceNo}</div></div><div style={{marginLeft:12,background:"#fef9c3",color:"#854d0e",fontSize:9,padding:"4px 8px",borderRadius:4}}>Complete your profile to access all welfare services</div></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:11}}>🔔 Notifications</div><button onClick={()=>{localStorage.clear();location.reload();}} style={{background:"#dc2626",color:"white",border:"none",padding:"4px 10px",borderRadius:4,fontSize:11}}>Logout</button><button onClick={()=>setTab("profile")} style={{background:"#0f5c2e",color:"white",border:"none",padding:"4px 10px",borderRadius:4,fontSize:11}}>Complete Profile</button><img src={pic||`https://ui-avatars.com/api/?name=${user.fullName}&background=0f5c2e&color=fff`} onClick={()=>fileRef.current.click()} style={{width:30,height:30,borderRadius:"50%",cursor:"pointer"}}/><input type="file" ref={fileRef} onChange={doUpload} accept="image/*" style={{display:"none"}}/></div>
        </div>

        <div style={{padding:16,maxWidth:1050}}>
          {tab==="dashboard"&&(
            <>
              {/* GOOD MORNING EXACT */}
              <div><h2 style={{margin:"0 0 2px",fontSize:15,fontWeight:600}}>Good Morning, {user.fullName?.split(" ")[0]} 👋</h2><div style={{fontSize:13,fontWeight:600}}>My Welfare Journey</div><div style={{fontSize:10,color:"#6b7280"}}>Welcome back, Ezekiel<br/>Here's your welfare journey</div></div>

              {/* YOU'RE BUILDING YOUR WELFARE FOUNDATION - FRESH */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>🛡️ You're building your welfare foundation</div>
                <div style={{fontSize:11,marginTop:6,color:"#374151"}}>You have successfully completed <b>{welfarePoints} of the required 6 contributions</b>. Only {Math.max(0,6-welfarePoints)} more successful contributions to become eligible for welfare claims.</div>
                <div style={{fontSize:10,marginTop:4,color:"#6b7280"}}>Current Welfare Points: {welfarePoints} - Fresh WONJUGA WELFARE start from {OFFICIAL_COMMENCEMENT.toLocaleDateString('en-GH',{month:'long',year:'numeric'})} - Old INTAKE 28 payments NOT counted</div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginTop:12}}>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}>
                  <div style={{fontSize:11,fontWeight:600}}>Progress Summary</div>
                  <div style={{fontSize:9,color:"#6b7280"}}>Your current status from the Progression Engine</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10,fontSize:10}}>
                    <div>MEMBERSHIP STATUS<br/><b style={{fontSize:11}}>Active</b></div>
                    <div>MEMBERSHIP ID<br/><b>{user.serviceNo}</b></div>
                    <div>CLAIM ELIGIBILITY<br/><b>{welfarePoints>=6?"Eligible":"Not yet"}</b></div>
                    <div>TOTAL CONTRIBUTIONS<br/><b>{welfarePoints} - Fresh WONJUGA</b></div>
                    <div>LAST ACTIVITY<br/><b>{myReqs[0]?new Date().toLocaleDateString():OFFICIAL_COMMENCEMENT.toLocaleDateString()}</b></div>
                    <div>JOINED<br/><b>{OFFICIAL_COMMENCEMENT.toLocaleDateString()}</b></div>
                  </div>
                </div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:10,textAlign:"left",fontWeight:600}}>Achievement Badge</div>
                  <div style={{fontSize:28,marginTop:12}}>🌱</div>
                  <div style={{fontSize:11,fontWeight:600,marginTop:6}}>Starter Member</div>
                  <div style={{fontSize:9,color:"#6b7280"}}>0-5 Welfare Points<br/>Keep going</div>
                  <div style={{marginTop:8,fontSize:10,background:"#f3f4f6",borderRadius:12,padding:"2px 8px",display:"inline-block"}}>{welfarePoints} / 5</div>
                </div>
              </div>

              {/* WELFARE PROGRESS EXACT */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:11,fontWeight:600}}>Welfare Progress</div>
                <div style={{fontSize:9,color:"#6b7280"}}>Benefit percentage and progress toward 30 Welfare Points</div>
                <div style={{display:"flex",gap:20,marginTop:10}}>
                  <div><div style={{fontSize:20,fontWeight:700}}>{welfarePercent.toFixed(0)}%</div><div style={{fontSize:9,color:"#6b7280"}}>Benefit percentage</div></div>
                  <div><div style={{fontSize:20,fontWeight:700}}>{welfarePoints}</div><div style={{fontSize:9,color:"#6b7280"}}>Welfare Points<br/>Active starter - Welfare Maturity - 0% points<br/>From fresh commencement</div></div>
                </div>
                <div style={{height:6,background:"#e5e7eb",borderRadius:4,marginTop:10}}><div style={{width:`${welfarePercent}%`,height:6,background:"#0f5c2e",borderRadius:4}}></div></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:12,fontSize:10}}>
                  <div><div style={{fontWeight:600}}>Next Milestone</div><div>Current<br/>{welfarePoints} Welfare Points<br/>{welfarePercent.toFixed(0)}%</div><div style={{marginTop:6}}>Next milestone: Membership Maturity<br/>Only {Math.max(0,6-welfarePoints)} more contributions required to become eligible<br/>2 Welfare Points and benefit of receiving</div><div style={{marginTop:6}}>2 Welfare Points = 25%<br/>Next milestone - Membership Maturity</div></div>
                  <div><div style={{fontWeight:600}}>6 Welfare Points<br/>25%</div><div style={{fontSize:9,color:"#6b7280"}}>6 Welfare Points = 25% benefit - eligible for claims after 6 fresh contributions</div></div>
                  <div><div style={{fontWeight:600}}>Contribution Streak</div><div style={{display:"flex",gap:16,marginTop:4}}><div><div style={{fontSize:14,fontWeight:700}}>1</div><div style={{fontSize:8}}>CURRENT STREAK<br/>Months</div></div><div><div style={{fontSize:14,fontWeight:700}}>2</div><div style={{fontSize:8}}>BEST STREAK<br/>Months</div></div></div></div>
                </div>
              </div>

              {/* CONTRIBUTION STATISTICS EXACT */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginTop:12}}>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:10,fontWeight:600}}>Contribution Statistics</div><div style={{fontSize:20,fontWeight:700,marginTop:6}}>{welfarePoints}</div><div style={{fontSize:9,color:"#6b7280"}}>SUCCESSFUL CONTRIBUTIONS<br/>Fresh WONJUGA count - Old NOT counted</div></div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:20,fontWeight:700}}>{myReqs.length>0?1:0}</div><div style={{fontSize:9,color:"#6b7280"}}>CONTRIBUTED THIS YEAR<br/>From {OFFICIAL_COMMENCEMENT.getFullYear()}</div></div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:20,fontWeight:700}}>{Math.max(0,1-welfarePoints)}</div><div style={{fontSize:9,color:"#6b7280"}}>OUTSTANDING CONTRIBUTIONS<br/>Pay to stay active</div></div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:600}}>Active</div><div style={{fontSize:9,color:"#6b7280"}}>SYSTEM STATUS<br/>WONJUGA WELFARE fresh portal</div></div>
              </div>

              {/* OUTSTANDING CONTRIBUTIONS */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:11,fontWeight:600}}>Outstanding Contributions</div>
                <div style={{fontSize:9,color:"#6b7280"}}>Keep your account active by staying up to date. Pay now to remain in good standing and protect future eligibility.</div>
                <div style={{marginTop:8,background:"#f9fafb",border:"1px solid #f3f4f6",borderRadius:6,padding:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:10,fontWeight:600}}>{new Date().toLocaleDateString('en-GH',{month:'long',year:'numeric'})} - Fresh WONJUGA</div><div style={{fontSize:9,color:"#6b7280"}}>GHS 50.00 - Default, pay more if debt</div></div>
                  <button onClick={()=>setTab("contributions")} style={{padding:"6px 12px",background:"#0f5c2e",color:"white",border:"none",borderRadius:4,fontSize:10,cursor:"pointer"}}>Pay Now</button>
                </div>
              </div>

              {/* ESTIMATED CLAIM BENEFITS */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:11,fontWeight:600}}>Estimated Claim Benefits</div>
                <div style={{fontSize:9,color:"#6b7280",marginTop:4}}>Benefit estimate based on current welfare percentage and maximum benefit. This is not a guarantee of payout. Actual benefit depends on available funds and eligibility verification at claim time. Fresh WONJUGA calculation.</div>
                <div style={{fontSize:10,marginTop:8}}>Current estimated benefit: <b>GHS {welfarePoints>=6?welfarePoints*50:0}.00</b> {welfarePoints<6&&"(Become eligible after 6 fresh contributions)"}</div>
              </div>

              {/* WELFARE JOURNEY TIMELINE */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:11,fontWeight:600}}>Welfare Journey Timeline</div>
                <div style={{marginTop:8,fontSize:10}}>
                  <div style={{display:"flex",gap:8,padding:"6px 0"}}><span style={{color:"#16a34a"}}>✓</span> Joined WONJUGA Welfare Scheme<br/>{OFFICIAL_COMMENCEMENT.toLocaleDateString()}</div>
                  <div style={{display:"flex",gap:8,padding:"6px 0"}}><span style={{color:welfarePoints>=1?"#16a34a":"#d1d5db"}}>{welfarePoints>=1?"✓":"○"}</span> First Contribution<br/>{myReqs[0]?new Date().toLocaleDateString():"Not yet - Fresh start"}</div>
                  <div style={{display:"flex",gap:8,padding:"6px 0"}}><span style={{color:welfarePoints>=8?"#16a34a":"#d1d5db"}}>{welfarePoints>=8?"✓":"○"}</span> Reached 25% Benefit<br/>8 Welfare Points</div>
                  <div style={{display:"flex",gap:8,padding:"6px 0"}}><span style={{color:welfarePoints>=15?"#16a34a":"#d1d5db"}}>{welfarePoints>=15?"✓":"○"}</span> Reached 50% Benefit</div>
                  <div style={{display:"flex",gap:8,padding:"6px 0"}}><span style={{color:welfarePoints>=30?"#16a34a":"#d1d5db"}}>{welfarePoints>=30?"✓":"○"}</span> Reached Maximum Benefit</div>
                  <div style={{fontSize:9,color:"#6b7280",marginTop:6}}>Next milestone: Membership Maturity - Only {Math.max(0,6-welfarePoints)} more to become eligible - Fresh WONJUGA count</div>
                </div>
              </div>

              <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:10,marginTop:12,fontSize:10}}>
                <div style={{fontWeight:600}}>Active — good standing</div>
                <div style={{color:"#166534",marginTop:2}}>You are in good standing with the welfare scheme. Keep making your regular monthly contributions to grow your Welfare Points and benefit percentage.</div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:600}}>Recent Claims</div><div style={{fontSize:9,color:"#6b7280"}}>Your latest welfare claims</div><div style={{fontSize:10,marginTop:8,color:"#6b7280"}}>You haven't submitted any claims yet.<br/>Once you're eligible, your submitted claims will appear here.</div></div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:600}}>Why Consistency Matters</div><div style={{fontSize:9,marginTop:6,color:"#374151"}}>Regular contributions help increase Welfare Points, improve benefit percentage and strengthen your protection. Every contribution counts. Fresh WONJUGA start ensures fair calculation from commencement month.</div><div style={{fontSize:9,marginTop:8,color:"#6b7280"}}>Thank you for being part of GIS WONJUGA Welfare. Every consistent contribution builds a stronger future for you and your peers.</div></div>
              </div>

              {/* OFFICIAL WELFARE CONSTITUTION EXACT LIKE VIDEO */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:11,fontWeight:600}}>Official Welfare Constitution</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginTop:8,fontSize:9}}>
                  <div>GIS WONJUGA WELFARE Constitution<br/>Official WONJUGA WELFARE Constitution</div>
                  <div>VERSION<br/>1.0<br/>Official Constitution</div>
                  <div>EFFECTIVE DATE<br/>26 August 2026<br/>Date the constitution governs the Welfare Scheme</div>
                  <div>STATUS<br/>Active<br/>Constitution</div>
                </div>
                <div style={{marginTop:8,fontSize:9}}>This document governs the Welfare Scheme including:<br/>• Membership • Contributions • Claims Administration • Executive Administration<br/>All members are encouraged to read and understand the constitution before participating in the Welfare Scheme.</div>
                <div style={{display:"flex",gap:8,marginTop:10}}><button onClick={()=>setShowConst(true)} style={{padding:"6px 10px",background:"#0f5c2e",color:"white",border:"none",borderRadius:4,fontSize:10,cursor:"pointer"}}>View Constitution</button><button onClick={()=>setShowConst(true)} style={{padding:"6px 10px",background:"white",border:"1px solid #e5e7eb",borderRadius:4,fontSize:10,cursor:"pointer"}}>Download Constitution</button></div>
              </div>

              {/* MEMBER OVERVIEW EXACT LIKE VIDEO */}
              <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12,marginTop:12}}>
                <div style={{fontSize:11,fontWeight:600}}>Member Overview</div>
                <div style={{fontSize:9,color:"#6b7280"}}>Current dues, payments, and welfare support at a glance</div>
                <div style={{fontSize:11,fontWeight:600,marginTop:10}}>My Membership Status</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:8,marginTop:6,fontSize:9,background:"#f9fafb",padding:8,borderRadius:6}}>
                  <div>CURRENT MONTH<br/><b>{new Date().toLocaleDateString('en-GH',{month:'long',year:'numeric'})}<br/>{myPaid>0?"Paid":"Not paid - Fresh"}</b></div>
                  <div>LAST PAYMENT<br/><b>Last GHS {myPaid>0?50:0}.00 Monthly<br/>Date on {myReqs[0]?new Date().toLocaleDateString():"--"}</b></div>
                  <div>TOTAL PAID<br/><b>Last {welfarePoints} of {myPaid>0?"GHS "+myPaid:0}<br/>Total {welfarePoints} - Fresh</b></div>
                  <div>LAST RECEIPT<br/><b>Last on {myReqs[0]?new Date().toLocaleDateString():OFFICIAL_COMMENCEMENT.toLocaleDateString()}<br/>Receipt</b></div>
                  <div>MEMBER SUMMARY<br/><b>Not verified support<br/>No welfare support<br/>received yet</b></div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:10}}><button onClick={()=>setTab("contributions")} style={{padding:"5px 10px",background:"black",color:"white",border:"none",borderRadius:4,fontSize:9,cursor:"pointer"}}>My Contributions</button><button style={{padding:"5px 10px",background:"white",border:"1px solid #e5e7eb",borderRadius:4,fontSize:9}}>Payment History</button><button style={{padding:"5px 10px",background:"white",border:"1px solid #e5e7eb",borderRadius:4,fontSize:9}}>Welfare Support</button><button style={{padding:"5px 10px",background:"white",border:"1px solid #e5e7eb",borderRadius:4,fontSize:9}}>Receipts</button></div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:600}}>Profile Completion - 27%</div><div style={{height:6,background:"#e5e7eb",borderRadius:4,marginTop:6}}><div style={{width:"27%",height:6,background:"#0f5c2e",borderRadius:4}}></div></div><div style={{fontSize:9,marginTop:6}}>Complete your profile to unlock all welfare services</div><div style={{fontSize:9,marginTop:6}}><b>Missing:</b><br/>• Email<br/>• Address<br/>• Place of Birth<br/>• Emergency Contact<br/>• Employment Information</div><button onClick={()=>setTab("profile")} style={{marginTop:8,padding:"6px 10px",background:"black",color:"white",border:"none",borderRadius:4,fontSize:9,cursor:"pointer"}}>Complete Profile</button></div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:600}}>Member Summary</div><div style={{fontSize:9,marginTop:4}}>TOTAL PAID {welfarePoints} | GHS {myPaid}.00 | {myReqs[0]?new Date().toLocaleDateString():"Fresh"}<br/>TOTAL POINTS {welfarePoints} | STATUS Active<br/>LAST CONTRIBUTION {myReqs[0]?new Date().toLocaleDateString():"None - Fresh"}<br/>STATUS Active - Fresh WONJUGA</div></div>
                  <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:600}}>Announcements - 0</div><div style={{fontSize:9,color:"#6b7280"}}>No announcements available for you</div></div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:600}}>Recent Welfare History</div><div style={{fontSize:9,color:"#6b7280"}}>Latest welfare assistance and paid benefits</div><div style={{fontSize:9,marginTop:8}}>No welfare assistance or paid benefits yet</div></div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:600}}>My Contributions</div><div style={{fontSize:9,color:"#6b7280"}}>Total contributions - Your payment summary</div><div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:10}}><div>Total<br/>contributions<br/><b>{welfarePoints}</b></div><div>Total amount paid<br/><b>GHS {myPaid}.00<br/>Fresh WONJUGA</b></div><div>Last<br/>Contribution<br/><b>{myReqs[0]?new Date().toLocaleDateString('en-GH',{day:'2-digit',month:'short',year:'numeric'}):"No payments<br/>yet"}</b></div></div><button onClick={()=>setTab("contributions")} style={{marginTop:8,padding:"5px 10px",background:"black",color:"white",border:"none",borderRadius:4,fontSize:9,cursor:"pointer"}}>View Contributions</button></div>
              </div>
            </>
          )}

          {tab==="contributions"&&(
            <div><h3>Contributions - Fresh WONJUGA - Auto % from {OFFICIAL_COMMENCEMENT.toLocaleDateString()}</h3><div style={{background:"white",padding:14,borderRadius:8,border:"1px solid #e5e7eb"}}><div>{new Date().toLocaleDateString('en-GH',{month:'long',year:'numeric'})} - GHS 50.00 - Fresh</div><input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)} style={{padding:8,borderRadius:6,border:"1px solid #d1d5db",width:120,marginTop:8}}/><button onClick={doPay} style={{marginLeft:8,padding:"8px 14px",background:"#0f5c2e",color:"white",border:"none",borderRadius:6,cursor:"pointer"}}>Pay GHS {payAmount} - Fresh count</button><div style={{marginTop:12}}>Points: {welfarePoints}/30 = {welfarePercent.toFixed(1)}% - Auto calculated from commencement</div></div></div>
          )}
          {tab==="addMember"&&isAdmin&&(<div style={{background:"white",padding:14,borderRadius:8,border:"1px solid #e5e7eb"}}><h3>Add Member - Fresh 0</h3><input placeholder="Full Name" value={addForm.fullName} onChange={e=>setAddForm({...addForm,fullName:e.target.value})} style={{width:"100%",padding:9,margin:"5px 0",borderRadius:6,border:"1px solid #e5e7eb"}}/><input placeholder="Phone" value={addForm.phone} onChange={e=>setAddForm({...addForm,phone:e.target.value})} style={{width:"100%",padding:9,margin:"5px 0",borderRadius:6,border:"1px solid #e5e7eb"}}/><input placeholder="Service No" value={addForm.serviceNo} onChange={e=>setAddForm({...addForm,serviceNo:e.target.value})} style={{width:"100%",padding:9,margin:"5px 0",borderRadius:6,border:"1px solid #e5e7eb"}}/><button onClick={doAdd} style={{width:"100%",padding:10,background:"#0f5c2e",color:"white",border:"none",borderRadius:6,cursor:"pointer"}}>Add Member - Fresh Start 0 Points</button></div>)}
        </div>

        {showConst&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowConst(false)}>
            <div style={{background:"white",width:"100%",maxWidth:900,height:"90vh",borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
              <div style={{padding:"12px 16px",background:"#0f5c2e",color:"white",display:"flex",justifyContent:"space-between"}}><div><b>WONJUGA WELFARE CONSTITUTION - Version 2.0</b><div style={{fontSize:10}}>INTAKE 28 replaced with WONJUGA WELFARE - Fresh portal from {OFFICIAL_COMMENCEMENT.toLocaleDateString()}</div></div><button onClick={()=>setShowConst(false)} style={{background:"#dc2626",color:"white",border:"none",borderRadius:4,padding:"4px 10px",cursor:"pointer"}}>Close X</button></div>
              <iframe src="/constitution_v1.pdf" style={{width:"100%",height:"100%",border:"none"}} title="Constitution"></iframe>
            </div>
          </div>
        )}

        <div onClick={openWhatsAppGroup} style={{position:"fixed",bottom:20,right:20,width:52,height:52,background:"#22c55e",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:22,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.2)",zIndex:9999}}>💬</div>
        <div style={{textAlign:"center",fontSize:8,color:"#9ca3af",marginTop:20,padding:10}}>© 2025 GIS WONJUGA WELFARE PORTAL • Powered by exclusive hans • Fresh Start {OFFICIAL_COMMENCEMENT.toLocaleDateString()} • Points {welfarePoints}/30 • {welfarePercent.toFixed(1)}% • FHIL {PAY_HIDDEN} hidden</div>
      </div>
    </div>
  );
}
