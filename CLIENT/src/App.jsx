import { useState, useEffect } from 'react'

export default function App() {
  const [user, setUser] = useState(null)
  const [serviceNo, setServiceNo] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showJoin, setShowJoin] = useState(false)
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || null)

  const [members, setMembers] = useState(JSON.parse(localStorage.getItem('members') || '[{"name":"Ezekiel Amoateng","serviceNo":"IS/13984","phone":"0240000000"}]'))
  const [contributions, setContributions] = useState(JSON.parse(localStorage.getItem('contributions') || '[]'))

  const [mName, setMName] = useState(''); const [mNo, setMNo] = useState(''); const [mPhone, setMPhone] = useState('')
  const [amount, setAmount] = useState(''); const [desc, setDesc] = useState('Monthly Dues'); const [forWho, setForWho] = useState('IS/13984')

  useEffect(()=>{ localStorage.setItem('members', JSON.stringify(members)) },[members])
  useEffect(()=>{ localStorage.setItem('contributions', JSON.stringify(contributions)) },[contributions])
  useEffect(()=>{ if(profilePic) localStorage.setItem('profilePic', profilePic) },[profilePic])

  const myContribs = contributions.filter(c=> c.serviceNo === user?.serviceNo)
  const totalPaid = myContribs.reduce((s,c)=> s + Number(c.amount), 0)
  const target = 1000
  const percent = Math.min(100, Math.round((totalPaid/target)*100))

  if (showJoin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f5] px-4">
        <div className="w-full max-w-[400px] bg-white rounded-xl border p-6">
          <h3 className="font-bold text-lg text-center">Request Access</h3>
          <div className="space-y-3 mt-4">
            <input id="jname" placeholder="Full Name" className="w-full border rounded px-3 py-3 text-sm" />
            <input id="jno" placeholder="Service No IS/XXXXX" className="w-full border rounded px-3 py-3 text-sm" />
            <input id="jphone" placeholder="Phone" className="w-full border rounded px-3 py-3 text-sm" />
            <button onClick={()=>{
              const name=document.getElementById('jname').value; const no=document.getElementById('jno').value; const phone=document.getElementById('jphone').value;
              if(!name||!no) return alert('Fill name & Service No');
              setMembers([...members, {name, serviceNo:no, phone}]); alert('Request Sent! You can now login with '+no); setShowJoin(false)
            }} className="w-full bg-[#14532d] text-white py-3 rounded text-sm">Submit Request</button>
            <button onClick={()=>setShowJoin(false)} className="w-full text-xs text-gray-500">Back</button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7f5] px-4">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-900 rounded-full flex items-center justify-center text-white font-bold text-xl">GIS</div>
          <h1 className="text-2xl font-bold mt-3">GIS INTAKE 28</h1>
          <p className="text-xs text-gray-500">Official Welfare Management Platform</p>
        </div>
        <div className="w-full max-w-[400px] bg-white rounded-xl border p-6">
          <h3 className="text-center font-semibold">Welcome Back</h3>
          <div className="space-y-4 mt-4">
            <input value={serviceNo} onChange={e=>setServiceNo(e.target.value)} placeholder="IS/ 13984 or GH/ADMIN" className="w-full border rounded px-3 py-3 text-sm" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (any for now)" className="w-full border rounded px-3 py-3 text-sm" />
            <button onClick={()=>{
              if(!serviceNo) return alert('Enter Service Number');
              const found = members.find(m=> m.serviceNo===serviceNo);
              const displayName = serviceNo==='GH/ADMIN'? 'Admin - Ezekiel' : found? found.name : `Member ${serviceNo}`;
              setUser({name: displayName, serviceNo, role: serviceNo==='GH/ADMIN'?'admin':'member'})
            }} className="w-full bg-[#14532d] text-white py-3 rounded text-sm">Sign in</button>
          </div>
          <p className="text-[11px] text-center mt-4">V2.4 - <span onClick={()=>setShowJoin(true)} className="text-green-800 font-bold underline cursor-pointer">New member? Request Access</span></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#f8faf8]">
      <div className="w-64 bg-white border-r p-4 hidden md:flex flex-col">
        <div className="mb-6"><p className="text-xs font-bold">GIS INTAKE 28</p><p className="text-[10px] text-gray-500">{user.serviceNo}</p></div>
        <div className="space-y-1">
          <button onClick={()=>setActiveTab('dashboard')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='dashboard'?'bg-green-900 text-white':''}`}>Dashboard</button>
          <button onClick={()=>setActiveTab('profile')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='profile'?'bg-green-900 text-white':''}`}>My Profile</button>
          <button onClick={()=>setActiveTab('contributions')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='contributions'?'bg-green-900 text-white':''}`}>My Contributions</button>
          {user.role==='admin' && <button onClick={()=>setActiveTab('admin')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='admin'?'bg-yellow-500 text-white':'bg-yellow-100'}`}>Admin - Members ({members.length})</button>}
        </div>
        <button onClick={()=>setUser(null)} className="mt-auto w-full bg-red-50 text-red-600 py-2 rounded text-sm">Logout</button>
      </div>

      <div className="flex-1 p-4 md:p-6">
        <h1 className="font-bold text-lg">Good Evening, {user.name} 👋</h1>

        {activeTab==='dashboard' && (
          <div className="mt-4 bg-white border rounded-xl p-5">
            <p className="text-sm font-medium">Welfare Journey - {percent}%</p>
            <div className="flex justify-between mt-3 text-sm"><span>Paid</span><b className="text-green-800">GHS {totalPaid}</b></div>
            <div className="flex justify-between text-sm"><span>Target</span><b>GHS {target}</b></div>
            <div className="w-full h-2 bg-gray-100 rounded mt-2"><div className="h-2 bg-green-800 rounded" style={{width:`${percent}%`}}></div></div>
            <p className="text-xs text-gray-500 mt-2">{myContribs.length} records for you</p>
          </div>
        )}

        {activeTab==='profile' && (
          <div className="mt-4 bg-white border rounded-xl p-5">
            <h3 className="font-bold">My Profile</h3>
            <div className="mt-4 flex gap-4 items-center">
              {profilePic? <img src={profilePic} className="w-24 h-24 rounded-full object-cover" /> : <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-xs">No Photo</div>}
              <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files[0]; if(f) setProfilePic(URL.createObjectURL(f))}} className="text-xs" />
            </div>
            <p className="mt-4 text-sm"><b>Name:</b> {user.name}<br/><b>Service No:</b> {user.serviceNo}<br/><b>Role:</b> {user.role}</p>
          </div>
        )}

        {activeTab==='contributions' && (
          <div className="mt-4 bg-white border rounded-xl p-5">
            <h3 className="font-bold">My Contributions</h3>
            {myContribs.length===0 && <p className="text-sm text-gray-500 mt-3">No payments yet for {user.serviceNo}</p>}
            {myContribs.map((c,i)=>(
              <div key={i} className="flex justify-between border-b py-2 text-sm">
                <div><p>{c.desc}</p><p className="text-[11px] text-gray-500">{c.date} • For {c.serviceNo}</p></div>
                <b className="text-green-800">GHS {c.amount}</b>
              </div>
            ))}
          </div>
        )}

        {activeTab==='admin' && user.role==='admin' && (
          <div className="mt-4 space-y-4">
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-bold">Add New Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                <input value={mName} onChange={e=>setMName(e.target.value)} placeholder="Full Name" className="border rounded px-3 py-2 text-sm" />
                <input value={mNo} onChange={e=>setMNo(e.target.value)} placeholder="IS/XXXXX" className="border rounded px-3 py-2 text-sm" />
                <input value={mPhone} onChange={e=>setMPhone(e.target.value)} placeholder="Phone" className="border rounded px-3 py-2 text-sm" />
              </div>
              <button onClick={()=>{ if(!mName||!mNo) return alert('Enter name & Service No'); setMembers([...members, {name:mName, serviceNo:mNo, phone:mPhone}]); setMName(''); setMNo(''); setMPhone(''); }} className="mt-3 bg-green-900 text-white px-4 py-2 rounded text-sm">Add Member</button>
            </div>

            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-bold">Add Contribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3">
                <select value={forWho} onChange={e=>setForWho(e.target.value)} className="border rounded px-3 py-2 text-sm">
                  {members.map(m=><option key={m.serviceNo} value={m.serviceNo}>{m.serviceNo} - {m.name}</option>)}
                </select>
                <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="Amount" className="border rounded px-3 py-2 text-sm" />
                <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="border rounded px-3 py-2 text-sm" />
                <button onClick={()=>{ if(!amount) return alert('Enter amount'); setContributions([...contributions, {serviceNo: forWho, amount, desc, date: new Date().toLocaleDateString()}]); setAmount(''); }} className="bg-green-900 text-white px-4 py-2 rounded text-sm">Add</button>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-bold">All Members ({members.length})</h3>
              <div className="mt-3 space-y-1">
                {members.map((m,i)=>(
                  <div key={i} className="flex justify-between text-sm border-b py-2"><span>{m.serviceNo} - {m.name}</span><span className="text-xs text-gray-500">{m.phone}</span></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}