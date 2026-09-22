import { useState, useEffect } from 'react'

export default function App() {
  const [user, setUser] = useState(null)
  const [serviceNo, setServiceNo] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showJoin, setShowJoin] = useState(false)
  const [profilePics, setProfilePics] = useState(JSON.parse(localStorage.getItem('profilePics') || '{}'))
  const [members, setMembers] = useState(JSON.parse(localStorage.getItem('members') || '[{"name":"Ezekiel Amoateng","serviceNo":"IS/13984","phone":"0240000000"}]'))
  const [contributions, setContributions] = useState(JSON.parse(localStorage.getItem('contributions') || '[]'))
  const [mName, setMName] = useState(''); const [mNo, setMNo] = useState(''); const [mPhone, setMPhone] = useState('')
  const [amount, setAmount] = useState(''); const [desc, setDesc] = useState('Monthly Dues'); const [forWho, setForWho] = useState('IS/13984')

  useEffect(()=>{ localStorage.setItem('members', JSON.stringify(members)) },[members])
  useEffect(()=>{ localStorage.setItem('contributions', JSON.stringify(contributions)) },[contributions])
  useEffect(()=>{ localStorage.setItem('profilePics', JSON.stringify(profilePics)) },[profilePics])

  const handlePicUpload = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader()
    reader.onload = () => setProfilePics({...profilePics, [user.serviceNo]: reader.result})
    reader.readAsDataURL(file)
  }

  const myContribs = contributions.filter(c=> c.serviceNo === user?.serviceNo)
  const totalPaid = myContribs.reduce((s,c)=> s + Number(c.amount), 0)
  const target = 1000
  const percent = Math.min(100, Math.round((totalPaid/target)*100))
  const myPic = user? profilePics[user.serviceNo] : null

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
              setMembers([...members, {name, serviceNo:no, phone}]); alert('Request Sent! Login with '+no); setShowJoin(false)
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
        <div className="w-full max-w-[400px] bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-center font-semibold">Welcome Back</h3>
          <div className="space-y-4 mt-4">
            <input value={serviceNo} onChange={e=>setServiceNo(e.target.value)} placeholder="IS/ 13984 or GH/ADMIN" className="w-full border rounded px-3 py-3 text-sm" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (any for now)" className="w-full border rounded px-3 py-3 text-sm" />
            <button onClick={()=>{
              if(!serviceNo) return alert('Enter Service Number');
              const found = members.find(m=> m.serviceNo===serviceNo);
              const displayName = serviceNo==='GH/ADMIN'? 'Admin - Ezekiel' : found? found.name : `Member ${serviceNo}`;
              setUser({name: displayName, serviceNo, role: serviceNo==='GH/ADMIN'?'admin':'member'})
            }} className="w-full bg-[#14532d] text-white py-3 rounded text-sm font-bold">Sign in</button>
          </div>
          <p className="text-[11px] text-center mt-4">V2.6 - <span onClick={()=>setShowJoin(true)} className="text-green-800 font-bold underline cursor-pointer">New member? Request Access</span></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#f8faf8] pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <div className="w-64 bg-white border-r p-4 hidden md:flex flex-col">
        <div className="mb-6 flex items-center gap-2">
          {myPic? <img src={myPic} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-green-900 text-white flex items-center justify-center text-xs font-bold">{user.name[0]}</div>}
          <div><p className="text-xs font-bold">GIS INTAKE 28</p><p className="text-[10px] text-gray-500">{user.serviceNo}</p></div>
        </div>
        <div className="space-y-1">
          <button onClick={()=>setActiveTab('dashboard')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='dashboard'?'bg-green-900 text-white':''}`}>🏠 Dashboard</button>
          <button onClick={()=>setActiveTab('profile')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='profile'?'bg-green-900 text-white':''}`}>👤 My Profile</button>
          <button onClick={()=>setActiveTab('contributions')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='contributions'?'bg-green-900 text-white':''}`}>💰 Contributions</button>
          {user.role==='admin' && <button onClick={()=>setActiveTab('admin')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='admin'?'bg-yellow-500 text-white':'bg-yellow-100'}`}>⚙️ Admin ({members.length})</button>}
        </div>
        <button onClick={()=>setUser(null)} className="mt-auto w-full bg-red-50 text-red-600 py-2 rounded text-sm">Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex justify-between items-center bg-white p-3 rounded-xl border mb-4">
          <div className="flex items-center gap-2">
            {myPic? <img src={myPic} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-green-900 text-white flex items-center justify-center text-xs">{user.name[0]}</div>}
            <div><p className="text-xs font-bold">{user.name}</p><p className="text-[10px] text-gray-500">{user.serviceNo}</p></div>
          </div>
          <button onClick={()=>setUser(null)} className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded">Logout</button>
        </div>

        <h1 className="font-bold text-lg hidden md:block">Good Evening, {user.name} 👋</h1>
        <h1 className="font-bold text-base md:hidden">Good Evening, {user.name} 👋</h1>

        {activeTab==='dashboard' && (
          <div className="mt-4 bg-white border rounded-xl p-5 shadow-sm">
            <p className="text-sm font-medium">Welfare Journey - {percent}% Complete</p>
            <div className="flex justify-between mt-3 text-sm"><span>Paid</span><b className="text-green-800">GHS {totalPaid}</b></div>
            <div className="flex justify-between text-sm"><span>Target</span><b>GHS {target}</b></div>
            <div className="w-full h-2 bg-gray-100 rounded mt-2"><div className="h-2 bg-green-800 rounded transition-all" style={{width:`${percent}%`}}></div></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded-lg"><p className="text-[11px] text-gray-500">Total Paid</p><p className="font-bold text-green-800">GHS {totalPaid}</p></div>
              <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-[11px] text-gray-500">Remaining</p><p className="font-bold">GHS {target-totalPaid}</p></div>
            </div>
          </div>
        )}

        {activeTab==='profile' && (
          <div className="mt-4 bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold">My Profile</h3>
            <div className="mt-4 flex gap-4 items-center">
              {myPic? <img src={myPic} className="w-24 h-24 rounded-full object-cover border-2 border-green-800" /> : <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-xs">No Photo</div>}
              <div>
                <input type="file" accept="image/*" onChange={handlePicUpload} className="text-xs block" />
                <p className="text-[10px] text-gray-500 mt-1">Auto-saves forever</p>
              </div>
            </div>
            <div className="mt-4 text-sm bg-gray-50 p-3 rounded-lg"><p><b>Name:</b> {user.name}</p><p><b>Service No:</b> {user.serviceNo}</p><p><b>Role:</b> {user.role}</p></div>
          </div>
        )}

        {activeTab==='contributions' && (
          <div className="mt-4 bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold">My Contributions</h3>
            {myContribs.length===0 && <p className="text-sm text-gray-500 mt-3 bg-yellow-50 p-3 rounded">No payments yet for {user.serviceNo}. Contact Admin.</p>}
            <div className="mt-3">
            {myContribs.map((c,i)=>(
              <div key={i} className="flex justify-between border-b py-3 text-sm">
                <div><p className="font-medium">{c.desc}</p><p className="text-[11px] text-gray-500">{c.date}</p></div>
                <b className="text-green-800">GHS {c.amount}</b>
              </div>
            ))}
            </div>
          </div>
        )}

        {activeTab==='admin' && user.role==='admin' && (
          <div className="mt-4 space-y-4">
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <h3 className="font-bold">Add Member</h3>
              <div className="grid grid-cols-1 gap-2 mt-3">
                <input value={mName} onChange={e=>setMName(e.target.value)} placeholder="Full Name" className="border rounded px-3 py-3 text-sm" />
                <input value={mNo} onChange={e=>setMNo(e.target.value)} placeholder="IS/XXXXX" className="border rounded px-3 py-3 text-sm" />
                <input value={mPhone} onChange={e=>setMPhone(e.target.value)} placeholder="Phone" className="border rounded px-3 py-3 text-sm" />
              </div>
              <button onClick={()=>{ if(!mName||!mNo) return alert('Enter name & Service No'); setMembers([...members, {name:mName, serviceNo:mNo, phone:mPhone}]); setMName(''); setMNo(''); setMPhone(''); }} className="mt-3 w-full md:w-auto bg-green-900 text-white px-6 py-3 rounded text-sm">Add Member</button>
            </div>
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <h3 className="font-bold">Add Contribution</h3>
              <div className="grid grid-cols-1 gap-2 mt-3">
                <select value={forWho} onChange={e=>setForWho(e.target.value)} className="border rounded px-3 py-3 text-sm">
                  {members.map(m=><option key={m.serviceNo} value={m.serviceNo}>{m.serviceNo} - {m.name}</option>)}
                </select>
                <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="Amount" className="border rounded px-3 py-3 text-sm" />
                <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="border rounded px-3 py-3 text-sm" />
                <button onClick={()=>{ if(!amount) return alert('Enter amount'); setContributions([...contributions, {serviceNo: forWho, amount, desc, date: new Date().toLocaleDateString()}]); setAmount(''); }} className="bg-green-900 text-white px-6 py-3 rounded text-sm">Add Payment</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 px-1">
        <button onClick={()=>setActiveTab('dashboard')} className={`flex flex-col items-center text-[11px] px-3 py-1 rounded ${activeTab==='dashboard'?'text-green-800 bg-green-50 font-bold':''}`}><span>🏠</span>Dashboard</button>
        <button onClick={()=>setActiveTab('profile')} className={`flex flex-col items-center text-[11px] px-3 py-1 rounded ${activeTab==='profile'?'text-green-800 bg-green-50 font-bold':''}`}><span>👤</span>Profile</button>
        <button onClick={()=>setActiveTab('contributions')} className={`flex flex-col items-center text-[11px] px-3 py-1 rounded ${activeTab==='contributions'?'text-green-800 bg-green-50 font-bold':''}`}><span>💰</span>My Dues</button>
        {user.role==='admin' && <button onClick={()=>setActiveTab('admin')} className={`flex flex-col items-center text-[11px] px-3 py-1 rounded ${activeTab==='admin'?'text-yellow-700 bg-yellow-50 font-bold':''}`}><span>⚙️</span>Admin</button>}
      </div>
    </div>
  )
}