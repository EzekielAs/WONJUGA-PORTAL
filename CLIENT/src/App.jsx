import { useState, useEffect } from 'react'

export default function App() {
  const [user, setUser] = useState(null)
  const [serviceNo, setServiceNo] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showJoin, setShowJoin] = useState(false)
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || null)
  const [contributions, setContributions] = useState(JSON.parse(localStorage.getItem('contributions') || '[]'))
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('Monthly Dues')

  useEffect(()=>{
    localStorage.setItem('contributions', JSON.stringify(contributions))
  },[contributions])

  useEffect(()=>{
    if(profilePic) localStorage.setItem('profilePic', profilePic)
  },[profilePic])

  const totalPaid = contributions.reduce((sum,c)=> sum + Number(c.amount), 0)
  const target = 1000 // Change to your total welfare target e.g. 1000 GHS
  const percent = Math.min(100, Math.round((totalPaid/target)*100))

  if (showJoin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7f5] px-4">
        <div className="w-full max-w-[400px] bg-white rounded-xl border p-6">
          <h3 className="text-center font-bold text-lg">Request Access</h3>
          <p className="text-center text-xs text-gray-500 mb-6">New Intake 28 Member</p>
          <div className="space-y-4">
            <input placeholder="Full Name" className="w-full border rounded px-3 py-3 text-sm" />
            <input placeholder="Service Number IS/XXXXX" className="w-full border rounded px-3 py-3 text-sm" />
            <input placeholder="Phone Number" className="w-full border rounded px-3 py-3 text-sm" />
            <button onClick={()=>{ alert('Request Sent! Admin will approve you.'); setShowJoin(false)}} className="w-full bg-[#14532d] text-white py-3 rounded text-sm">Submit Request</button>
            <button onClick={()=>setShowJoin(false)} className="w-full text-xs text-gray-500">Back to Login</button>
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
          <h2 className="text-xl font-semibold">Welfare Portal</h2>
          <p className="text-xs text-gray-500">Official Welfare Management Platform</p>
        </div>
        <div className="w-full max-w-[400px] bg-white rounded-xl border p-6">
          <h3 className="text-center font-semibold">Welcome Back</h3>
          <p className="text-center text-xs text-gray-500 mb-6">Sign in to manage your welfare contributions.</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium">Service Number</label>
              <input value={serviceNo} onChange={e=>setServiceNo(e.target.value)} placeholder="IS/ 13984 or GH/ADMIN" className="w-full mt-1 border rounded px-3 py-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Any password works for now" className="w-full mt-1 border rounded px-3 py-3 text-sm" />
            </div>
            <button onClick={()=>{ if(!serviceNo) return alert('Enter Service Number'); setUser({name: serviceNo==='GH/ADMIN'?'Admin - Ezekiel':`Member ${serviceNo}`, serviceNo, role: serviceNo==='GH/ADMIN'?'admin':'member'}) }} className="w-full bg-[#14532d] text-white py-3 rounded text-sm">Sign in</button>
          </div>
          <p className="text-[11px] text-gray-500 text-center mt-4">Version V2.3 - <span onClick={()=>setShowJoin(true)} className="text-green-800 font-bold underline cursor-pointer">New member? Request Access</span></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#f8faf8]">
      <div className="w-64 bg-white border-r p-4 hidden md:flex flex-col">
        <div className="mb-6"><p className="text-xs font-bold">GIS INTAKE 28 - Member Portal</p><p className="text-[10px] text-gray-500">{user.serviceNo}</p></div>
        <div className="space-y-1">
          <button onClick={()=>setActiveTab('dashboard')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='dashboard'?'bg-green-900 text-white':'hover:bg-gray-100'}`}>Dashboard</button>
          <button onClick={()=>setActiveTab('profile')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='profile'?'bg-green-900 text-white':'hover:bg-gray-100'}`}>My Profile</button>
          <button onClick={()=>setActiveTab('contributions')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='contributions'?'bg-green-900 text-white':'hover:bg-gray-100'}`}>Contributions</button>
          {user.role==='admin' && <button onClick={()=>setActiveTab('admin')} className="w-full text-left px-3 py-2 rounded text-sm bg-yellow-100 font-bold">Admin - Add Payment</button>}
        </div>
        <button onClick={()=>setUser(null)} className="mt-auto w-full bg-red-50 text-red-600 py-2 rounded text-sm">Logout</button>
      </div>

      <div className="flex-1 p-6">
        <h1 className="text-lg font-bold">Good Evening, {user.name} 👋</h1>

        {/* DASHBOARD */}
        {activeTab==='dashboard' && (
          <>
            <h2 className="font-bold mt-2">My Welfare Journey - {percent}% Complete</h2>
            <div className="mt-4 bg-white border rounded-xl p-5">
              <div className="flex justify-between text-sm"><span>Total Paid</span><span className="font-bold text-green-800">GHS {totalPaid}</span></div>
              <div className="flex justify-between text-sm mt-1"><span>Target</span><span>GHS {target}</span></div>
              <div className="w-full h-2 bg-gray-100 rounded mt-3"><div className="h-2 bg-green-800 rounded" style={{width:`${percent}%`}}></div></div>
              <p className="text-xs text-gray-500 mt-3">{contributions.length===0? 'No contributions yet. Admin will add.' : `${contributions.length} payments recorded`}</p>
            </div>
          </>
        )}

        {/* PROFILE */}
        {activeTab==='profile' && (
          <div className="mt-4 bg-white border rounded-xl p-5">
            <h3 className="font-bold">My Profile Picture</h3>
            <div className="mt-4 flex items-center gap-4">
              {profilePic? <img src={profilePic} className="w-24 h-24 rounded-full object-cover border" /> : <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-xs">No Photo</div>}
              <input type="file" accept="image/*" onChange={(e)=>{ const f=e.target.files[0]; if(f){ const url=URL.createObjectURL(f); setProfilePic(url)}}} className="text-xs" />
            </div>
            <div className="mt-6 text-sm"><p><b>Service No:</b> {user.serviceNo}</p><p><b>Role:</b> {user.role}</p></div>
          </div>
        )}

        {/* CONTRIBUTIONS */}
        {activeTab==='contributions' && (
          <div className="mt-4 bg-white border rounded-xl p-5">
            <h3 className="font-bold mb-4">Contributions History</h3>
            {contributions.length===0 && <p className="text-sm text-gray-500">No contributions yet.</p>}
            <div className="space-y-2">
              {contributions.map((c,i)=>(
                <div key={i} className="flex justify-between border-b py-2 text-sm">
                  <div><p className="font-medium">{c.desc}</p><p className="text-[11px] text-gray-500">{c.date}</p></div>
                  <p className="font-bold text-green-800">+ GHS {c.amount}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN */}
        {activeTab==='admin' && (
          <div className="mt-4 bg-white border rounded-xl p-5">
            <h3 className="font-bold">Admin - Add Contribution</h3>
            <p className="text-xs text-gray-500 mb-4">Login as GH/ADMIN to see this. This will show for member {user.serviceNo}</p>
            <div className="space-y-3 max-w-sm">
              <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="Amount e.g. 100" className="w-full border rounded px-3 py-3 text-sm" />
              <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description e.g. Monthly Dues" className="w-full border rounded px-3 py-3 text-sm" />
              <button onClick={()=>{ if(!amount) return alert('Enter amount'); setContributions([...contributions, {amount, desc, date: new Date().toLocaleDateString()} ]); setAmount(''); alert('Added!'); }} className="w-full bg-green-900 text-white py-3 rounded text-sm">Add Payment</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}