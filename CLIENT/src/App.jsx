import { useState, useEffect } from 'react'
import './App.css'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore'

// REAL FIREBASE - GIS WONJUGA WELFARE
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

function App() {
  const [members, setMembers] = useState([])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    // Real-time listener - updates for all members instantly
    const q = collection(db, "contributions");
    const unsubscribe = onSnapshot(q, (snapshot)=>{
      const data = snapshot.docs.map(d=>({id:d.id, ...d.data()}))
      // Sort newest first
      data.sort((a,b)=> (b.timestamp || 0) - (a.timestamp || 0))
      setMembers(data)
      setLoading(false)
    }, (error)=>{
      console.log("Firestore error:", error)
      setLoading(false)
    })
    return ()=>unsubscribe()
  },[])

  const addContribution = async () => {
    if(!name || !amount) return alert("Please fill Member Name and Amount!")
    setLoading(true)
    try{
      await addDoc(collection(db, "contributions"), {
        name: name.trim(),
        amount: Number(amount),
        date: new Date().toLocaleDateString('en-GH'),
        timestamp: Date.now(),
        createdBy: "admin"
      })
      alert(`✅ GHS ${amount} saved for ${name} to CLOUD! All members will see it!`)
      setName(''); setAmount('')
    }catch(e){
      alert("❌ Firebase Error: " + e.message + "\n\nGo to Firebase Console > Firestore > Rules and set allow read, write: if true")
    }
    setLoading(false)
  }

  const total = members.reduce((s,m)=>s+(Number(m.amount)||0),0)

  return (
    <div style={{padding:20, fontFamily:'Segoe UI, Arial', maxWidth:500, margin:'auto', background:'#f8f9fa', minHeight:'100vh'}}>
      <h1 style={{background:'#0b6e4f', color:'white', padding:18, borderRadius:12, textAlign:'center', fontSize:16, boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}}>GIS WONJUGA WELFARE - LIVE V7.2</h1>
      
      <div style={{background:'white', padding:18, borderRadius:12, marginTop:12, borderLeft:'5px solid #0b6e4f', boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
        <h2 style={{margin:0, color:'#0b6e4f'}}>Total: GHS {total.toLocaleString()}</h2>
        <p style={{margin:'5px 0 0 0', color:'#666'}}>Members Paid: {members.length} {loading && "(Updating...)"}</p>
      </div>

      <div style={{marginTop:18, background:'white', padding:18, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
        <h3 style={{marginTop:0}}>Add Contribution</h3>
        <input placeholder="Member Name e.g. Kofi Mensah" value={name} onChange={e=>setName(e.target.value)} style={{width:'100%', padding:12, marginBottom:12, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}} />
        <input placeholder="Amount GHS e.g. 100" type="number" value={amount} onChange={e=>setAmount(e.target.value)} style={{width:'100%', padding:12, marginBottom:12, borderRadius:8, border:'1px solid #ccc', boxSizing:'border-box'}} />
        <button onClick={addContribution} disabled={loading} style={{width:'100%', padding:14, background: loading ? '#999' : '#0b6e4f', color:'white', border:'none', borderRadius:8, fontWeight:'bold', fontSize:15, cursor:'pointer'}}>{loading ? "SAVING..." : "SAVE TO CLOUD ☁️"}</button>
      </div>

      <div style={{marginTop:18, background:'white', padding:18, borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
        <h3 style={{marginTop:0}}>Recent Payments - Real Time</h3>
        {members.length === 0 && !loading && <p style={{color:'#999'}}>No payments yet. Be the first!</p>}
        {members.map((m,i)=><div key={m.id || i} style={{padding:12, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}><div><b>{m.name}</b><div style={{fontSize:12, color:'#888'}}>{m.date}</div></div><b style={{color:'#0b6e4f'}}>GHS {m.amount}</b></div>)}
      </div>
      
      <div style={{marginTop:20, textAlign:'center', padding:12, background:'#d4edda', borderRadius:8, color:'#155724', fontSize:13, fontWeight:'bold'}}>
        ✅ LIVE CONNECTED: gis-wonjuga-welfare.firebaseapp.com<br/>Real-time for all members
      </div>
    </div>
  )
}
export default App
