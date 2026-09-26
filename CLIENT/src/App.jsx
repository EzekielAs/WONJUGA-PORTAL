import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCqBe_TY3I4istScWiohcM1r4LQfEY2a7g",
  authDomain: "wonjuga-portal.firebaseapp.com",
  projectId: "wonjuga-portal",
  storageBucket: "wonjuga-portal.firebasestorage.app",
  messagingSenderId: "1081629612681",
  appId: "1:1081629612681:web:ec07a5c82da1eb3f4a1f26"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export default function App() {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("wonjuga_user") || "null"));
  const [tab, setTab] = useState("dashboard");
  const [show, setShow] = useState("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [service, setService] = useState("");
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState("");
  const [pic, setPic] = useState(localStorage.getItem("wonjuga_pic") || "");
  const fileRef = useRef();

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "members"), s => setMembers(s.docs.map(d => ({id:d.id,...d.data()}))));
    const unsub2 = onSnapshot(collection(db, "welfareRequests"), s => setRequests(s.docs.map(d => ({id:d.id,...d.data()}))));
    const unsub3 = onSnapshot(collection(db, "contributions"), s => setContributions(s.docs.map(d => ({id:d.id,...d.data()}))));
    const unsub4 = onSnapshot(collection(db, "payments"), s => setPayments(s.docs.map(d => ({id:d.id,...d.data()}))));
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if(hour < 12) return "Good Morning";
    if(hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const r = ref(storage, `pics/${currentUser.phone}`);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    localStorage.setItem("wonjuga_pic", url);
    setPic(url);
    alert("Profile Picture Saved Permanently!");
  };

  const handleLogin = async () => {
    if(!phone ||!password) return alert("Enter Phone & Password");
    const docRef = doc(db, "members", phone);
    const snap = await getDoc(docRef);
    if(!snap.exists()) return alert("User not found");
    if(snap.data().password!== password) return alert("Wrong password");
    if(snap.data().status === "Pending") return alert("Awaiting admin approval");
    localStorage.setItem("wonjuga_user", JSON.stringify(snap.data()));
    setCurrentUser(snap.data());
    setTab("dashboard");
  };

  const handleRegister = async () => {
    if(!phone ||!service ||!name) return alert("Enter Name, Phone & Service");
    await setDoc(doc(db, "members", phone), { name, phone, password, service, status: "Pending", photoURL: "", createdAt: new Date() });
    alert("Registered! Awaiting approval"); setShow("login");
  };

  const handleContribute = async () => {
    if(!amount) return alert("Enter amount");
    await addDoc(collection(db, "contributions"), { phone: currentUser.phone, name: currentUser.name, amount: Number(amount), date: new Date() });
    alert("Contribution added!"); setAmount("");
  };

  const handlePayment = async () => {
    if(!amount) return alert("Enter amount & service");
    await addDoc(collection(db, "payments"), { phone: currentUser.phone, name: currentUser.name, amount: Number(amount), service, date: new Date() });
    alert("Payment Submitted!"); setAmount("");
  };

  const handleRequest = async () => {
    if(!service) return alert("Enter Service Needed");
    await addDoc(collection(db, "welfareRequests"), { phone: currentUser.phone, name: currentUser.name, service, status: "Pending", date: new Date() });
    alert("Request Sent!");
  };

  if(!currentUser){
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f0f0f0'}}>
        <div style={{background:'white', padding:20, borderRadius:10, width:320}}>
          <h2 style={{textAlign:'center'}}>Wonjuga Welfare Portal</h2>
          <h4 style={{textAlign:'center'}}>{getGreeting()}</h4>
          {show==="login"? (
            <>
              <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%', padding:8, margin:'5px 0', border:'1px solid #ccc'}}/>
              <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%', padding:8, margin:'5px 0', border:'1px solid #ccc'}}/>
              <button onClick={handleLogin} style={{width:'100%', padding:10, background:'green', color:'white', border:'none', marginTop:10}}>Login</button>
              <p onClick={()=>setShow("register")} style={{textAlign:'center', color:'blue', cursor:'pointer'}}>Register New Member</p>
            </>
          ) : (
            <>
              <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} style={{width:'100%', padding:8, margin:'5px 0', border:'1px solid #ccc'}}/>
              <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%', padding:8, margin:'5px 0', border:'1px solid #ccc'}}/>
              <input placeholder="Service (e.g. Mason)" value={service} onChange={e=>setService(e.target.value)} style={{width:'100%', padding:8, margin:'5px 0', border:'1px solid #ccc'}}/>
              <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%', padding:8, margin:'5px 0', border:'1px solid #ccc'}}/>
              <button onClick={handleRegister} style={{width:'100%', padding:10, background:'blue', color:'white', border:'none', marginTop:10}}>Register</button>
              <p onClick={()=>setShow("login")} style={{textAlign:'center', color:'blue', cursor:'pointer'}}>Back to Login</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f5', padding:10}}>
      <div style={{background:'white', padding:15, display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:8}}>
        <h3>Wonjuga Welfare Portal</h3>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span>{getGreeting()}, {currentUser.name}</span>
          <img src={pic || "https://via.placeholder.com/40"} onClick={()=>fileRef.current.click()} style={{width:40, height:40, borderRadius:'50%', cursor:'pointer', border:'2px solid green'}} alt="pic"/>
          <input type="file" ref={fileRef} onChange={handleUpload} accept="image/*" style={{display:'none'}}/>
        </div>
      </div>

      <div style={{display:'flex', gap:10, margin:'15px 0'}}>
        <div onClick={()=>setTab("dashboard")} style={{flex:1, background:'white', padding:15, borderRadius:8, cursor:'pointer', border: tab==='dashboard'?'2px solid green':'1px solid #ddd'}}>Members: {members.length}</div>
        <div onClick={()=>setTab("contributions")} style={{flex:1, background:'white', padding:15, borderRadius:8, cursor:'pointer'}}>Contributions: {contributions.length} 💰</div>
        <div onClick={()=>setTab("requests")} style={{flex:1, background:'white', padding:15, borderRadius:8, cursor:'pointer'}}>Requests: {requests.filter(r=>r.status==="Pending").length}</div>
      </div>

      {tab==="dashboard" && (
        <div style={{background:'white', padding:15, borderRadius:8}}>
          <h4>Members List</h4>
          {members.map(m=>(
            <div key={m.id} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee'}}>
              <span><img src={m.photoURL||"https://via.placeholder.com/30"} style={{width:25, height:25, borderRadius:'50%', verticalAlign:'middle', marginRight:5}}/>{m.name} - {m.service} ({m.status})</span>
              <span>
                <button onClick={handleRequest} style={{background:'#007bff', color:'white', border:'none', padding:'5px 8px', borderRadius:4, marginRight:5}}>🤲 Claims/Welfare</button>
                <button onClick={()=>{ setService(m.service); setTab("payments")}} style={{background:'green', color:'white', border:'none', padding:'5px 8px', borderRadius:4, marginRight:5}}>💳 Make Payment</button>
                <button onClick={async()=>{ if(confirm("Delete?")) await deleteDoc(doc(db,"members",m.id))}} style={{background:'red', color:'white', border:'none', padding:'5px 8px', borderRadius:4}}>Delete</button>
              </span>
            </div>
          ))}
          <button onClick={()=>{ localStorage.clear(); setCurrentUser(null)}} style={{marginTop:15, background:'black', color:'white', padding:8, border:'none', borderRadius:5}}>Logout</button>
        </div>
      )}

      {tab==="contributions" && (
        <div style={{background:'white', padding:15, borderRadius:8}}>
          <h4>Contributions</h4>
          <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} style={{padding:8, border:'1px solid #ccc', marginRight:5}}/>
          <button onClick={handleContribute} style={{padding:'8px 12px', background:'green', color:'white', border:'none'}}>Add Contribution</button>
          {contributions.map(c=><div key={c.id} style={{padding:'5px 0', borderBottom:'1px solid #eee'}}>{c.name}: GHS {c.amount} on {new Date(c.date?.seconds*1000).toLocaleDateString()}</div>)}
        </div>
      )}

      {tab==="payments" && (
        <div style={{background:'white', padding:15, borderRadius:8}}>
          <h4>Make Payment</h4>
          <input placeholder="Service" value={service} onChange={e=>setService(e.target.value)} style={{padding:8, border:'1px solid #ccc', marginRight:5}}/>
          <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} style={{padding:8, border:'1px solid #ccc', marginRight:5}}/>
          <button onClick={handlePayment} style={{padding:'8px 12px', background:'green', color:'white', border:'none'}}>💳 Pay Now</button>
          {payments.map(p=><div key={p.id} style={{padding:'5px 0', borderBottom:'1px solid #eee'}}>{p.name}: GHS {p.amount} for {p.service}</div>)}
        </div>
      )}

      {tab==="requests" && (
        <div style={{background:'white', padding:15, borderRadius:8}}>
          <h4>Welfare Requests</h4>
          {requests.map(r=>(
            <div key={r.id} style={{padding:'8px 0', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
              <span>{r.name} - {r.service} ({r.status})</span>
              <span>
                <button onClick={async()=>await updateDoc(doc(db,"welfareRequests",r.id),{status:"Approved"})} style={{background:'green', color:'white', border:'none', padding:'4px 8px', marginRight:5}}>Approve</button>
                <button onClick={async()=>await deleteDoc(doc(db,"welfareRequests",r.id))} style={{background:'red', color:'white', border:'none', padding:'4px 8px'}}>Delete</button>
              </span>
            </div>
          ))}
        </div>
      )}
      <p style={{textAlign:'center', marginTop:20, color:'#666'}}>Fixed by Ezekiel - 26/09/2026 - FULL RESTORED</p>
    </div>
  )
}
