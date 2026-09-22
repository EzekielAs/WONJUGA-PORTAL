import { useState } from 'react'

export default function App() {
  const [user, setUser] = useState(null)
  const [serviceNo, setServiceNo] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showJoin, setShowJoin] = useState(false)
  const [profilePic, setProfilePic] = useState(null)

  // --- REQUEST ACCESS FORM ---
  if (showJoin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7f5] px-4">
        <div className="w-full max-w-[400px] bg-white rounded-xl border p-6">
          <h3 className="text-center font-bold text-lg">Request Access</h3>
          <p className="text-center text-xs text-gray-500 mb-6">New Intake 28 Member? Fill this form</p>
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
              <input value={serviceNo} onChange={e=>setServiceNo(e.target.value)} placeholder="IS/ 13984" className="w-full mt-1 border rounded px-3 py-3 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" className="w-full mt-1 border rounded px-3 py-3 text-sm" />
            </div>
            <button onClick={()=>{ if(!serviceNo) return alert('Enter Service Number'); setUser({name: 'Ezekiel Amoateng', serviceNo, role: serviceNo==='GH/ADMIN'?'admin':'member'}) }} className="w-full bg-[#14532d] text-white py-3 rounded text-sm">Sign in</button>
          </div>
          <p className="text-[11px] text-gray-500 text-center mt-4">Version V2.2 - <span onClick={()=>setShowJoin(true)} className="text-green-800 font-bold underline cursor-pointer">New member? Request Access</span></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#f8faf8]">
      <div className="w-64 bg-white border-r p-4 hidden md:block">
        <div className="mb-6"><p className="text-xs font-bold">GIS INTAKE 28 - Member Portal</p></div>
        <div className="space-y-1">
          <button onClick={()=>setActiveTab('dashboard')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='dashboard'?'bg-green-900 text-white':'hover:bg-gray-100'}`}>Dashboard</button>
          <button onClick={()=>setActiveTab('profile')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='profile'?'bg-green-900 text-white':'hover:bg-gray-100'}`}>My Profile</button>
          <button onClick={()=>setActiveTab('contributions')} className={`w-full text-left px-3 py-2 rounded text-sm ${activeTab==='contributions'?'bg-green-900 text-white':'hover:bg-gray-100'}`}>Contributions</button>
          {user.role==='admin' && <button onClick={()=>setActiveTab('admin')} className="w-full text-left px-3 py-2 rounded text-sm bg-yellow-100">Admin - Add Members</button>}
        </div>
        <button onClick={()=>setUser(null)} className="mt-10 w-full bg-red-50 text-red-600 py-2 rounded text-sm">Logout</button>
      </div>
      <div className="flex-1 p-6">
        <h1 className="text-lg font-bold">Good Evening, {user.name} 👋</h1>
        <p className="text-xs text-gray-500">Service No: {user.serviceNo}</p>

        {activeTab==='profile' && (
          <div className="mt-4 bg-white border rounded-xl p-5">
            <h3 className="font-bold">My Profile Picture</h3>
            <div className="mt-4 flex items-center gap-4">
              {profilePic? <img src={profilePic} className="w-24 h-24 rounded-full object-cover border" /> : <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-xs">No Photo</div>}
              <input type="file" accept="image/*" onChange={(e)=>{ const f=e.target.files[0]; if(f) setProfilePic(URL.createObjectURL(f)) }} className="text-xs" />
            </div>
            <p className="text-[11px] text-gray-400 mt-2">This preview works now. We will save to server later.</p>
          </div>
        )}

        {activeTab!=='profile' && (
          <>
            <h2 className="font-bold mt-4">My Welfare Journey - CLEAN START</h2>
            <div className="mt-4 bg-white border rounded-xl p-5">
              <p className="text-sm">You're building your welfare foundation - 27% complete</p>
              <div className="w-full h-2 bg-gray-100 rounded mt-3"><div className="h-2 bg-green-800 rounded" style={{width:'27%'}}></div></div>
              <p className="text-xs text-gray-500 mt-3">No contributions yet. This is a fresh account like you wanted.</p>
            </div>
            {activeTab==='admin' && <div className="mt-4 bg-white border p-4 rounded">Admin panel - Add members here (no old data)</div>}
          </>
        )}
      </div>
    </div>
  )
}