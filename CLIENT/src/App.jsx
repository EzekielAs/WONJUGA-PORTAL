import { useState } from 'react'
import AdminMembers from './AdminMembers.jsx'

export default function App() {
  const [user, setUser] = useState(null)
  const [serviceNo, setServiceNo] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [members, setMembers] = useState([])

  // LOGIN PAGE - Exactly like your video
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7f5] px-4">
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 bg-green-900 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3">GIS</div>
          <h1 className="text-2xl font-bold tracking-wide">GIS INTAKE 28</h1>
          <h2 className="text-xl font-semibold">Welfare Portal</h2>
          <p className="text-xs text-gray-500 mt-1">Official Welfare Management Platform</p>
        </div>

        <div className="w-full max-w-[400px] bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-center font-semibold">Welcome Back</h3>
          <p className="text-center text-xs text-gray-500 mb-6">Sign in to manage your welfare contributions.</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium">Service Number</label>
              <input value={serviceNo} onChange={e=>setServiceNo(e.target.value)} placeholder="IS/ 13984" className="w-full mt-1 border rounded-md px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-green-800" />
            </div>
            <div>
              <label className="text-xs font-medium">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" className="w-full mt-1 border rounded-md px-3 py-3 text-sm outline-none" />
              <p className="text-[11px] text-gray-400 mt-1">Minimum 8 characters</p>
            </div>
            <button
              onClick={()=>{
                if(serviceNo.trim()==='') return alert('Enter Service Number')
                setUser({ name: serviceNo.includes('/')? 'Member '+serviceNo.split('/')[1] : 'Ezekiel Amoateng', serviceNo, role: serviceNo==='GH/ADMIN'? 'admin' : 'member' })
              }}
              className="w-full bg-[#14532d] text-white py-3 rounded-md text-sm font-medium hover:bg-green-900"
            >Sign in</button>
          </div>

          <div className="text-center mt-4 space-y-1">
            <p className="text-[11px] text-gray-500">Version V2.2</p>
            <p className="text-xs"><span className="text-gray-500">New member?</span> <span className="text-green-800 font-medium">Request Access</span></p>
            <p className="text-[11px] text-gray-500">Activate Account - Forgot Password</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-6 text-center">© 2026 GIS WELFARE SYSTEM<br/>Powered by Group Name</p>
      </div>
    )
  }

  // DASHBOARD - Exactly like your first video
  return (
    <div className="min-h-screen flex bg-[#f8faf8]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-8"><div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center text-white text-xs">GIS</div><div><p className="text-xs font-bold">GIS INTAKE 28</p><p className="text-[10px] text-gray-500">Member Portal</p></div></div>
        <div className="space-y-1">
          {['Dashboard','My Profile','Welfare Support','My Claims','Contributions','Announcements','Notifications'].map(t=>(
            <button key={t} onClick={()=>setActiveTab(t.toLowerCase())} className={`w-full text-left px-3 py-2.5 rounded-md text-sm ${activeTab===t.toLowerCase()? 'bg-[#14532d] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{t}</button>
          ))}
          {user.role==='admin' && <button onClick={()=>setActiveTab('admin')} className={`w-full text-left px-3 py-2.5 rounded-md text-sm ${activeTab==='admin'?'bg-green-900 text-white':''}`}>👑 Admin - Add Members</button>}
        </div>
        <button onClick={()=>setUser(null)} className="mt-10 w-full bg-red-50 text-red-600 py-2 rounded text-sm">Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
          <p className="text-sm font-semibold">{user.serviceNo} - {user.name}</p>
          <button onClick={()=>setUser(null)} className="bg-red-600 text-white px-3 py-1 rounded text-xs">Logout</button>
        </div>

        <div className="p-4 md:p-6">
          {activeTab==='dashboard' && (
            <div className="space-y-4">
              <h1 className="text-lg font-semibold">Good Evening, {user.name} 👋</h1>
              <h2 className="font-bold">My Welfare Journey</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white rounded-xl border p-5">
                  <h3 className="font-semibold text-sm">You're building your welfare foundation</h3>
                  <p className="text-xs text-gray-500 mt-2">Building strong welfare foundation takes time. Stay consistent.</p>
                  <div className="mt-4"><p className="text-xs font-medium">Progress Summary</p><p className="text-xs mt-2">Profile Completion 27%</p><div className="w-full h-1.5 bg-gray-100 rounded mt-1"><div className="h-1.5 bg-green-800 rounded" style={{width:'27%'}}/></div></div></div>
                </div>
                <div className="bg-white rounded-xl border p-5 text-center"><p className="text-xs">Achievement Badge</p><div className="w-12 h-12 bg-yellow-100 rounded-full mx-auto mt-4 flex items-center justify-center">🏅</div><p className="text-sm font-semibold mt-2">Starter Member</p></div>
              </div>
              <div className="bg-white rounded-xl border p-5"><h4 className="text-sm font-semibold">Official Welfare Constitution</h4><div className="flex gap-2 mt-3"><button className="bg-green-800 text-white px-3 py-1.5 rounded text-xs">View Constitution</button><button className="border px-3 py-1.5 rounded text-xs">Download</button></div></div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border p-4"><p className="text-xs font-semibold">My Membership Status</p><p className="text-[11px] text-gray-500">Welfare ID: WEL-{Date.now()}</p><p className="mt-3 text-xs">Profile 27%</p><div className="w-full h-1 bg-gray-100 rounded"><div className="h-1 bg-green-800 rounded w-[27%]"/></div></div>
                <div className="bg-white rounded-xl border p-4"><p className="text-xs font-semibold">Recent Welfare History</p><p className="text-[11px] text-gray-400 mt-10 text-center">No welfare history yet.</p></div>
                <div className="bg-white rounded-xl border p-4"><p className="text-xs font-semibold">My Contributions</p><div className="flex justify-between mt-4 text-xs"><span>Total 2</span><span>GHS 100.00</span></div><button className="mt-3 bg-black text-white text-[11px] px-3 py-1 rounded">View Contributions</button></div>
              </div>
            </div>
          )}
          {activeTab==='admin' && <AdminMembers />}
          {activeTab!=='dashboard' && activeTab!=='admin' && (
            <div className="bg-white rounded-xl border p-10 text-center"><p className="text-sm font-semibold">{activeTab}</p><p className="text-xs text-gray-400 mt-2">This section is empty for new members - CLEAN START</p></div>
          )}
        </div>
      </div>
    </div>
  )
}