// V7 GIS WONJUGA DEMO - All features working
import { useState, useEffect } from 'react'
import './App.css'
import { db } from './firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

function App() {
  const [members, setMembers] = useState([])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(()=>{
    getDocs(collection(db, "contributions")).then(snap=>{
      setMembers(snap.docs.map(d=>d.data()))
    })
  },[])

  const addContribution = async () => {
    if(!name || !amount) return alert("Fill all!")
    await addDoc(collection(db, "contributions"), {
      name, amount: Number(amount), date: new Date().toLocaleDateString()
    })
    alert("Added! Refresh page")
    setName(''); setAmount('')
  }

  const total = members.reduce((s,m)=>s+(m.amount||0),0)

  return (
    <div style={{padding:20, fontFamily:'Arial', maxWidth:500, margin:'auto'}}>
      <h1 style={{background:'#0b6e4f', color:'white', padding:15, borderRadius:10, textAlign:'center'}}>GIS WONJUGA WELFARE - DEMO V7</h1>
      
      <div style={{background:'#e8f5e9', padding:15, borderRadius:10, marginTop:10}}>
        <h3>Total Contributions: GHS {total}</h3>
        <p>Members Paid: {members.length}</p>
      </div>

      <div style={{marginTop:20, border:'1px solid #ccc', padding:15, borderRadius:10}}>
        <h3>Add Contribution</h3>
        <input placeholder="Member Name" value={name} onChange={e=>setName(e.target.value)} style={{width:'100%', padding:10, marginBottom:10}} />
        <input placeholder="Amount GHS" type="number" value={amount} onChange={e=>setAmount(e.target.value)} style={{width:'100%', padding:10, marginBottom:10}} />
        <button onClick={addContribution} style={{width:'100%', padding:12, background:'#0b6e4f', color:'white', border:'none', borderRadius:8}}>SAVE</button>
      </div>

      <div style={{marginTop:20}}>
        <h3>Recent Payments</h3>
        {members.map((m,i)=><div key={i} style={{padding:10, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}><span>{m.name}</span><b>GHS {m.amount}</b></div>)}
      </div>
      
      <p style={{marginTop:20, textAlign:'center', color:'green'}}>✅ Firebase: gis-wonjuga-welfare - DEMO MODE</p>
    </div>
  )
}
export default App
