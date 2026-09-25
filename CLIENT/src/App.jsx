import { useState, useEffect } from "react";

export default function App() {
  const [user, setUser] = useState(null);
  const [serviceNo, setServiceNo] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [profilePics, setProfilePics] = useState({});
  const [members, setMembers] = useState(()=>{
    const saved = localStorage.getItem("members");
    return saved? JSON.parse(saved) : [
      { serviceNo: "GH/ADMIN001", name: "Admin - Ezekiel", phone: "0550000001", role: "admin", password: "admin123", totalPaid: 0 },
    ];
  });
  const [contributions, setContributions] = useState(()=>{
    const saved = localStorage.getItem("contributions");
    return saved? JSON.parse(saved) : [];
  });

  useEffect(()=>{ localStorage.setItem("members", JSON.stringify(members)) }, [members]);
  useEffect(()=>{ localStorage.setItem("contributions", JSON.stringify(contributions)) }, [contributions]);

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => { setProfilePics({...profilePics, [user.serviceNo]: reader.result}); localStorage.setItem("pics", JSON.stringify({...profilePics, [user.serviceNo]: reader.result})) };
    reader.readAsDataURL(file);
  };

  const myContribs = contributions.filter(c=>c.serviceNo === user?.serviceNo);
  const totalPaid = myContribs.reduce((a,b)=>a+Number(b.amount),0);
  const allPaid = contributions.reduce((a,b)=>a+Number(b.amount),0);
  const target = 500;
  const percent = Math.min(100, Math.round((totalPaid/target)*100));

  const login = () => {
    if(!serviceNo ||!password) return alert("Enter Service No and Password");
    const sn = serviceNo.trim().toUpperCase();
    let found = members.find(m=>m.serviceNo.toUpperCase() === sn);
    if(!found) return alert("Member not found");
    if(!found.password){ const updated = members.map(m=> m.serviceNo.toUpperCase()===sn? {...m, password} : m); setMembers(updated); found = {...found, password}; alert("Password set!"); }
    if(found.password!== password) return alert("Wrong password!");
    setUser(found); localStorage.setItem("user", JSON.stringify(found));
  };
  const logout = () => { setUser(null); localStorage.removeItem("user"); };

  useEffect(()=>{ const u = localStorage.getItem("user"); if(u) setUser(JSON.parse(u)); const p = localStorage.getItem("pics"); if(p) setProfilePics(JSON.parse(p)); },[]);

  const handleBulkImport = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split("\n").filter(l=>l.trim());
      const newMembers = [];
      lines.forEach(line=>{
        const [sNo, name, phone] = line.split(",").map(x=>x.trim());
        if(sNo && name){ newMembers.push({ serviceNo: sNo.toUpperCase(), name, phone: phone||"", role: "member", password: "", totalPaid: 0 }) }
      });
      // Remove duplicates
      const existing = new Set(members.map(m=>m.serviceNo.toUpperCase()));
      const filtered = newMembers.filter(m=>!existing.has(m.serviceNo.toUpperCase()));
      setMembers([...members,...filtered]);
      alert(`Imported ${filtered.length} members! ${newMembers.length-filtered.length} duplicates skipped.`);
    };
    reader.readAsText(file);
  };

  if(!user){
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f3] p-4">
        <div className="bg-white w-full max-w-[380px] p-8 rounded-[16px] shadow-xl">
          <h1 className="text-center text-2xl font-bold text-green-800">V3.8 GIS INTAKE 28</h1>
          <p className="text-center text-[11px] text-gray-500 mb-6">Secure Welfare Portal</p>
          <input value={serviceNo} onChange={e=>setServiceNo(e.target.value)} placeholder="IS/ 13984" className="w-full bg-gray-50 border rounded-xl p-3 mb-3 uppercase" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full bg-gray-50 border rounded-xl p-3 mb-3" />
          <button onClick={login} className="w-full bg-green-800 text-white p-3 rounded-xl font-bold">Sign in</button>
          <p className="text-[11px] text-center mt-4 text-green-700">V3.8 - Bulk Ready</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f3] pb-20">
      <div className="flex">
        <div className="hidden md:block w-[260px] bg-white h-screen p-4 border-r sticky top-0">
          <h2 className="font-bold text-green-800">GIS INTAKE 28</h2><p className="text-xs text-gray-500 mb-6">{user.serviceNo} • {user.role}</p>
          <button onClick={()=>setActiveTab('dashboard')} className={`w-full text-left p-3 rounded-lg mb-2 ${activeTab==='dashboard'?'bg-green-800 text-white':'hover:bg-gray-100'}`}>Dashboard</button>
          <button onClick={()=>setActiveTab('profile')} className={`w-full text-left p-3 rounded-lg mb-2 ${activeTab==='profile'?'bg-green-800 text-white':'hover:bg-gray-100'}`}>My Profile</button>
          <button onClick={()=>setActiveTab('contributions')} className={`w-full text-left p-3 rounded-lg mb-2 ${activeTab==='contributions'?'bg-green-800 text-white':'hover:bg-gray-100'}`}>Contributions</button>
          {user.role==='admin' && <button onClick={()=>setActiveTab('admin')} className={`w-full text-left p-3 rounded-lg ${activeTab==='admin'?'bg-green-800 text-white':'hover:bg-gray-100'}`}>Admin ({members.length})</button>}
          <div className="mt-6 text-xs text-gray-500">Total Collected: GHS {allPaid}<br/>Members: {members.length}</div>
          <button onClick={logout} className="w-full mt-6 text-red-500 text-left p-3">Logout</button>
        </div>

        <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
          {activeTab==='dashboard' && (
            <div>
              <h1 className="text-2xl font-bold">Good Evening, {user.name}</h1>
              <div className="bg-yellow-50 p-4 rounded-xl border mb-4 mt-4"><p className="font-bold">Welfare Journey - {percent}% Complete</p><p className="text-sm">GHS {totalPaid} of {target}</p><div className="w-full bg-gray-200 h-3 rounded-full mt-2"><div className="bg-green-700 h-3 rounded-full transition-all" style={{width: `${percent}%`}}></div></div></div>
              <div className="bg-white p-4 rounded-xl border"><p className="text-sm">Your Payments: {myContribs.length} • Total Members Paid: {allPaid}</p></div>
            </div>
          )}
          {activeTab==='profile' && (
            <div className="bg-white border rounded-xl p-4 shadow-sm"><h3 className="font-bold mb-3">My Profile</h3><p>Name: {user.name}</p><p>Service: {user.serviceNo}</p><p>Paid: GHS {totalPaid}</p><input type="file" accept="image/*" onChange={handlePicUpload} className="mt-3" />{profilePics[user.serviceNo] && <img src={profilePics[user.serviceNo]} className="w-20 h-20 rounded-full mt-2 object-cover" />}</div>
          )}
          {activeTab==='contributions' && (
            <div className="bg-white border rounded-xl p-4"><h3 className="font-bold mb-2">My Contributions</h3>{myContribs.length===0? <p className="text-sm text-gray-400">No payments yet — Go to Admin to add</p> : myContribs.map((c,i)=>(<div key={i} className="flex justify-between border-b py-2 text-sm"><span>{c.month} • {c.date}</span><span className="font-bold">GHS {c.amount}</span></div>))}</div>
          )}
          {activeTab==='admin' && user.role==='admin' && (
            <div className="space-y-4">
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-bold text-green-800 mb-2">BULK IMPORT INTAKE 28 (CSV)</h3>
                <p className="text-[11px] text-gray-500 mb-2">File format: One member per line like this<br/>IS/13980, John Mensah, 0551234567<br/>IS/13981, Ama Doe, 0557654321</p>
                <input type="file" accept=".csv,.txt" onChange={handleBulkImport} className="w-full border p-2 rounded bg-gray-50" />
                <p className="text-xs mt-2 text-green-700">Tip: Create Excel, Save As CSV, then upload here</p>
              </div>

              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-bold mb-3">Add Single Contribution (Makes % move)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input id="cService" placeholder="IS/13980" className="border p-2 rounded uppercase" />
                  <input id="cAmount" placeholder="50" type="number" className="border p-2 rounded" />
                  <input id="cMonth" placeholder="May 2026" className="border p-2 rounded col-span-2" />
                  <button onClick={()=>{
                    const sn=document.getElementById('cService').value.toUpperCase();
                    const amt=Number(document.getElementById('cAmount').value);
                    const month=document.getElementById('cMonth').value||'May 2026';
                    if(!sn||!amt) return alert('Enter service and amount');
                    setContributions([...contributions,{serviceNo:sn, amount:amt, month, date:new Date().toLocaleDateString()}]);
                    alert(`Added GHS ${amt} for ${sn} - Check Dashboard now!`);
                  }} className="bg-green-800 text-white rounded p-2 col-span-2">Add Payment + Update %</button>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-bold mb-2">All Members ({members.length})</h3>
                <input placeholder="Search IS/..." value={search} onChange={e=>setSearch(e.target.value)} className="border p-2 rounded w-full mb-2" />
                <div className="max-h-[300px] overflow-auto text-sm">
                  {members.filter(m=>m.serviceNo.includes(search.toUpperCase())||m.name.toLowerCase().includes(search.toLowerCase())).map((m,i)=>(<div key={i} className="flex justify-between border-b py-1"><span>{m.serviceNo} - {m.name}</span><span className="text-gray-500">{m.phone}</span></div>))}
                </div>
                <div className="flex gap-2 mt-3">
                  <input id="rService" placeholder="IS/XXXXX to reset password" className="border p-2 rounded flex-1" />
                  <button onClick={()=>{ const sn=document.getElementById('rService').value.toUpperCase(); setMembers(members.map(m=>m.serviceNo.toUpperCase()===sn?{...m,password:""}:m)); alert('Reset done'); }} className="bg-red-600 text-white px-4 rounded">Reset</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
        <button onClick={()=>setActiveTab('dashboard')} className={activeTab==='dashboard'?'text-green-800 font-bold':''}>Dash</button>
        <button onClick={()=>setActiveTab('profile')} className={activeTab==='profile'?'text-green-800 font-bold':''}>Profile</button>
        <button onClick={()=>setActiveTab('contributions')} className={activeTab==='contributions'?'text-green-800 font-bold':''}>Pay</button>
        {user.role==='admin' && <button onClick={()=>setActiveTab('admin')} className={activeTab==='admin'?'text-green-800 font-bold':''}>Admin ({members.length})</button>}
      </div>
    </div>
  );
}