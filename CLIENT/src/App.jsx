import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [staffId, setStaffId] = useState('')
  const [phone, setPhone] = useState('')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('wonjuga_user') || 'null'))
  const [error, setError] = useState('')

  // Mock data - later we connect to real DB
  const welfareData = {
    completed: 2,
    required: 6,
    points: 2,
    name: user?.idNumber?.split('/')[0] || 'Ezekiel',
    fullId: user?.idNumber || 'IS/12197'
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post(`${API_URL}/login`, { idNumber: staffId, phone })
      localStorage.setItem('wonjuga_user', JSON.stringify(res.data.user))
      setUser(res.data.user)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed - check ID and Phone')
    }
  }

  const logout = () => {
    localStorage.removeItem('wonjuga_user')
    setUser(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-6">WONJUGA Login</h1>
          <input className="w-full border p-3 rounded-lg mb-3" placeholder="Staff ID e.g. GH/ADMIN001" value={staffId} onChange={e=>setStaffId(e.target.value)} required />
          <input className="w-full border p-3 rounded-lg mb-3" placeholder="Phone e.g. 0550000001" value={phone} onChange={e=>setPhone(e.target.value)} required />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button className="w-full bg-green-700 text-white p-3 rounded-lg font-bold">Login</button>
        </form>
      </div>
    )
  }

  const remaining = welfareData.required - welfareData.completed
  const percent = (welfareData.completed / welfareData.required) * 100
  const hour = new Date().getHours()
  const greeting = hour < 12? 'Good Morning' : hour < 18? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div>
            <p className="font-bold text-sm leading-none">Ezekiel Asomani</p>
            <p className="text-xs text-gray-500">{welfareData.fullId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">🔔</div>
            <span className="absolute -top-1 -right-1 bg-green-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">3</span>
          </div>
          <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">↪</button>
        </div>
      </div>

      {/* Complete Profile Banner */}
      <div className="px-4 mt-3">
        <p className="text-sm text-gray-600 mb-2">Complete your profile to access all welfare services.</p>
        <button className="w-full bg-[#0d5c3a] text-white py-3 rounded-lg font-semibold text-sm">Complete Profile</button>
      </div>

      {/* Journey */}
      <div className="px-4 mt-6">
        <h2 className="text-lg">{greeting}, {welfareData.name} 👋</h2>
        <h1 className="text-2xl font-bold text-[#0d5c3a] mt-1">My Welfare Journey</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back.<br/>Here's your Welfare Journey.</p>

        {/* Card */}
        <div className="mt-4 bg-[#eef6ff] border border-blue-100 rounded-2xl p-5">
          <div className="flex gap-2 items-start">
            <span className="text-xl">♡</span>
            <h3 className="font-bold text-[#1a365d] text-lg leading-tight">You're building your welfare foundation</h3>
          </div>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            You have successfully completed {welfareData.completed} of the required {welfareData.required} contributions.
          </p>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Only {remaining} more successful contributions to become eligible for welfare claims.
          </p>
          <p className="font-semibold text-sm mt-4">Current Welfare Points: {welfareData.points}</p>

          {/* Progress Bar */}
          <div className="mt-4 bg-white rounded-full h-2 overflow-hidden">
            <div className="bg-[#0d5c3a] h-2 rounded-full" style={{width: `${percent}%`}}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{welfareData.completed}/{welfareData.required} completed</p>
        </div>

        {/* Progress Summary */}
        <div className="mt-4 bg-white rounded-2xl p-5 shadow-sm border">
          <h3 className="font-semibold">Progress Summary</h3>
          <p className="text-sm text-gray-500">Your membership position from the Progressive Engine.</p>
          <div className="mt-4">
            <p className="text-xs text-gray-500 tracking-widest">MEMBERSHIP STATUS</p>
            <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">Building Foundation</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App