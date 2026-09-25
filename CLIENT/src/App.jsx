import { useState, useEffect } from "react";

export default function App(){
  const [user,setUser]=useState(null);
  const [serviceNo,setServiceNo]=useState("");
  const [password,setPassword]=useState("");
  const [activeTab,setActiveTab]=useState("dashboard");
  const [search,setSearch]=useState("");
  const [profilePics,setProfilePics]=useState({});
  const [addService,setAddService]=useState("");
  const [addAmount,setAddAmount]=useState("");
  const [addMonth,setAddMonth]=useState("May 2026");
  const [annTitle,setAnnTitle]=useState("");
  const [annBody,setAnnBody]=useState("");
  const [claimReason,setClaimReason]=useState("");
  const [claimAmount,setClaimAmount]=useState("");
  const [showNotif,setShowNotif]=useState(false);
  const [adminService,setAdminService]=useState("");
  const [adminName,setAdminName]=useState("");
  const [adminPass,setAdminPass]=useState("");

  const [members,setMembers]=useState(()=>{ const s=localStorage.getItem("members"); return s?JSON.parse(s):[{serviceNo:"GH/ADMIN001",name:"Admin - Ezekiel",phone:"0550000001",role:"admin",password:"admin123",totalPaid:0}]; });
  const [contributions,setContributions]=useState(()=>{ const s=localStorage.getItem("contributions"); return s?JSON.parse(s):[]; });
  const [announcements,setAnnouncements]=useState(()=>{ const s=localStorage.getItem("announcements"); return s?JSON.parse(s):[{id:1,title:"Welcome Intake 28",body:"Welfare portal V4.1 live. Target GHS 500 per member.",date:new Date().toLocaleDateString()}]; });
  const [claims,setClaims]=useState(()=>{ const s=localStorage.getItem("claims"); return s?JSON.parse(s):[]; });
  const [notifications,setNotifications]=useState(()=>{ const s=localStorage.getItem("notifications"); return s?JSON.parse(s):[{id:1,title:"Welcome!",body:"Your welfare portal is live.",date:new Date().toLocaleString(),read:false,for:"ALL"}]; });

  useEffect(()=>{localStorage.setItem("members",JSON.stringify(members))},[members]);
  useEffect(()=>{localStorage.setItem("contributions",JSON.stringify(contributions))},[contributions]);
  useEffect(()=>{localStorage.setItem("announcements",JSON.stringify(announcements))},[announcements]);
  useEffect(()=>{localStorage.setItem("claims",JSON.stringify(claims))},[claims]);
  useEffect(()=>{localStorage.setItem("notifications",JSON.stringify(notifications))},[notifications]);

  const addNotif=(title,body,forWho="ALL")=>{
    const n={id:Date.now(),title,body,date:new Date().toLocaleString(),read:false,for:forWho};
    setNotifications([n,...notifications]);
  };

  const handlePicUpload=(e)=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{ const np={...profilePics,[user.serviceNo]:r.result}; setProfilePics(np); localStorage.setItem("pics",JSON.stringify(np)) };
    r.readAsDataURL(f);
  };

  const myContribs=contributions.filter(c=>c.serviceNo===user?.serviceNo);
  const totalPaid=myContribs.reduce((a,b)=>a+Number(b.amount),0);
  const allPaid=contributions.reduce((a,b)=>a+Number(b.amount),0);
  const target=500; const percent=Math.min(100,Math.round((totalPaid/target)*100));
  const myNotifs=notifications.filter(n=>n.for==="ALL" || n.for===user?.serviceNo);
  const unread=myNotifs.filter(n=>!n.read).length;

  const login=()=>{
    if(!serviceNo||!password) return alert("Enter Service No and Password");
    const sn=serviceNo.trim().toUpperCase();
    let found=members.find(m=>m.serviceNo.toUpperCase()===sn);
    if(!found) return alert("Member not found");
    if(!found.password){ const upd=members.map(m=>m.serviceNo.toUpperCase()===sn?{...m,password}:m); setMembers(upd); found={...found,password}; alert("Password set! Login again"); return; }
    if(found.password!==password) return alert("Wrong password!");
    setUser(found); localStorage.setItem("user",JSON.stringify(found));
  };
  const logout=()=>{ setUser(null); localStorage.removeItem("user"); };
  useEffect(()=>{ const u=localStorage.getItem("user"); if(u) setUser(JSON.parse(u)); const p=localStorage.getItem("pics"); if(p) setProfilePics(JSON.parse(p)); },[]);

  const handleBulkImport=(e)=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const text=ev.target.result; const lines=text.split("\n").filter(l=>l.trim());
      const newMembers=[]; lines.forEach(line=>{ const [sNo,name,phone]=line.split(",").map(x=>x.trim()); if(sNo&&name){ newMembers.push({serviceNo:sNo.toUpperCase(),name,phone:phone||"",role:"member",password:"",totalPaid:0}) } });
      const existing=new Set(members.map(m=>m.serviceNo.toUpperCase()));
      const filtered=newMembers.filter(m=>!existing.has(m.serviceNo.toUpperCase()));
      setMembers([...members,...filtered]); alert(`Imported ${filtered.length} members!`); addNotif("Members Imported",`${filtered.length} new members added`,"ALL");
    }; reader.readAsText(file);
  };

  if(!user){
    return (<div className="min-h-screen flex items-center justify-center bg-[#f6f6f3] p-4"><div className="bg-white w-full max-w-[380px] p-8 rounded-[16px] shadow-xl"><h1 className="text-center text-2xl font-bold text-green-800">GIS INTAKE 28</h1><p className="text-center text-[11px] text-gray-500 mb-6">V4.1 Add Admin Ready</p><input value={serviceNo} onChange={e=>setServiceNo(e.target.value)} placeholder="GH/ADMIN001 or IS/..." className="w-full bg-gray-50 border rounded-xl p-3 mb-3 uppercase" /><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full bg-gray-50 border rounded-xl p-3 mb-3" /><button onClick={login} className="w-full bg-green-800 text-white p-3 rounded-xl font-bold">Sign in</button></div></div>);
  }

  return (
    <div className="min-h-screen bg-[#f6f6f3] pb-20">
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center p-3 px-4">
          <p className="font-bold text-green-800">GIS INTAKE 28 • {user.serviceNo}</p>
          <div className="flex items-center gap-3">
            <button onClick={()=>{ setShowNotif(!showNotif); if(!showNotif) setNotifications(notifications.map(n=>myNotifs.find(m=>m.id===n.id)?{...n,read:true}:n)); }} className="relative text-xl">🔔{unread>0&&<span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{unread}</span>}</button>
            <button onClick={logout} className="text-sm text-red-500">Logout</button>
          </div>
        </div>
        {showNotif&&(<div className="max-w-5xl mx-auto p-2"><div className="bg-white border shadow-xl rounded-xl max-h-[350px] overflow-auto"><div className="p-3 border-b flex justify-between"><p className="font-bold">Notifications ({myNotifs.length})</p><button onClick={()=>setNotifications(notifications.map(n=>({...n,read:true})))} className="text-xs text-green-700">Mark all read</button></div>{myNotifs.length===0?<p className="p-4 text-sm text-gray-400">No notifications</p>:myNotifs.map(n=>(<div key={n.id} className={`p-3 border-b text-sm ${!n.read?'bg-yellow-50':''}`}><p className="font-bold">{n.title} <span className="font-normal text-[11px] text-gray-500">{n.date}</span></p><p>{n.body}</p></div>))}</div></div>)}
      </div>

      <div className="flex">
        <div className="hidden md:block w-[260px] bg-white h-screen p-4 border-r sticky top-[49px]">
          <button onClick={()=>setActiveTab('dashboard')} className={`w-full text-left p-3 rounded-lg mb-1 ${activeTab==='dashboard'?'bg-green-800 text-white':'hover:bg-gray-100'}`}>Dashboard</button>
          <button onClick={()=>setActiveTab('profile')} className={`w-full text-left p-3 rounded-lg mb-1 ${activeTab==='profile'?'bg-green-800 text-white':'hover:bg-gray-100'}`}>Profile</button>
          <button onClick={()=>setActiveTab('support')} className={`w-full text-left p-3 rounded-lg mb-1 ${activeTab==='support'?'bg-green-800 text-white':'hover:bg-gray-100'}`}>Welfare Support</button>
          <button onClick={()=>setActiveTab('claims')} className={`w-full text-left p-3 rounded-lg mb-1 ${activeTab==='claims'?'bg-green-800 text-white':'hover:bg-gray-100'}`}>Claims</button>
          <button onClick={()=>setActiveTab('contributions')} className={`w-full text-left p-3 rounded-lg mb-1 ${activeTab==='contributions'?'bg-green-800 text-white':'hover:bg-gray-100'}`}>Contributions</button>
          <button onClick={()=>setActiveTab('announcement')} className={`w-full text-left p-3 rounded-lg mb-1 ${activeTab==='announcement'?'bg-green-800 text-white':'hover:bg-gray-100'}`}>Announcement</button>
          <button onClick={()=>setActiveTab('notifications')} className={`w-full text-left p-3 rounded-lg mb-1 flex justify-between ${activeTab==='notifications'?'bg-green-800 text-white':'hover:bg-gray-100'}`}><span>Notifications</span>{unread>0&&<span className="bg-red-600 text-white text-xs px-2 rounded-full">{unread}</span>}</button>
          {user.role==='admin'&&<button onClick={()=>setActiveTab('admin')} className={`w-full text-left p-3 rounded-lg mt-2 ${activeTab==='admin'?'bg-green-800 text-white':'bg-yellow-100'}`}>Admin ({members.length})</button>}
          <div className="mt-6 text-xs text-gray-500">Total: GHS {allPaid}<br/>Members: {members.length} • Admins: {members.filter(m=>m.role==='admin').length}</div>
        </div>

        <div className="flex-1 p-4 max-w-5xl mx-auto w-full">
          {activeTab==='dashboard'&&(<div className="space-y-4"><h1 className="text-2xl font-bold">Good Evening, {user.name.split(" ")[0]}</h1><div className="bg-white p-4 rounded-xl border shadow-sm"><p className="font-bold">Welfare Journey - {percent}% Complete</p><p className="text-sm text-gray-600">GHS {totalPaid} of {target}</p><div className="w-full bg-gray-200 h-3 rounded-full mt-2"><div className="bg-green-700 h-3 rounded-full" style={{width:`${percent}%`}}></div></div></div><div className="grid grid-cols-2 md:grid-cols-3 gap-3"><button onClick={()=>setActiveTab('profile')} className="bg-white border rounded-xl p-4 text-left"><div className="text-2xl">👤</div><p className="font-bold mt-1">Profile</p><p className="text-xs text-gray-500">{user.serviceNo}</p></button><button onClick={()=>setActiveTab('support')} className="bg-white border rounded-xl p-4 text-left"><div className="text-2xl">🤝</div><p className="font-bold mt-1">Welfare Support</p><p className="text-xs text-gray-500">Benefits</p></button><button onClick={()=>setActiveTab('claims')} className="bg-green-50 border border-green-200 rounded-xl p-4 text-left"><div className="text-2xl">📝</div><p className="font-bold mt-1">Claims</p><p className="text-xs text-gray-500">{claims.filter(c=>c.serviceNo===user.serviceNo).length} claims</p></button><button onClick={()=>setActiveTab('contributions')} className="bg-white border rounded-xl p-4 text-left"><div className="text-2xl">💰</div><p className="font-bold mt-1">Contributions</p><p className="text-xs text-gray-500">GHS {totalPaid}</p></button><button onClick={()=>setActiveTab('announcement')} className="bg-yellow-50 border rounded-xl p-4 text-left"><div className="text-2xl">📢</div><p className="font-bold mt-1">Announcement</p><p className="text-xs text-gray-500">{announcements.length} updates</p></button><button onClick={()=>setActiveTab('notifications')} className="bg-red-50 border border-red-200 rounded-xl p-4 text-left col-span-2 md:col-span-1"><div className="text-2xl">🔔 {unread>0?`(${unread})`:''}</div><p className="font-bold mt-1">Notifications</p><p className="text-xs text-gray-500">{unread} unread</p></button></div></div>)}
          {activeTab==='notifications'&&(<div className="space-y-3"><h3 className="font-bold text-lg">Notifications 🔔</h3><div className="bg-white border rounded-xl"><div className="p-3 border-b flex justify-between"><p className="font-bold">All ({myNotifs.length}) - {unread} unread</p><button onClick={()=>setNotifications([])} className="text-xs text-red-500">Clear all</button></div>{myNotifs.map(n=>(<div key={n.id} className={`p-4 border-b ${!n.read?'bg-yellow-50':''}`}><p className="font-bold text-sm">{n.title}</p><p className="text-sm mt-1">{n.body}</p><p className="text-[11px] text-gray-400 mt-1">{n.date} • To: {n.for}</p></div>))}</div></div>)}
          {activeTab==='profile'&&(<div className="bg-white border rounded-xl p-5"><h3 className="font-bold mb-3 text-lg">Profile</h3><p className="font-bold">{user.name}</p><p className="text-sm">{user.serviceNo} • Paid GHS {totalPaid} ({percent}%)</p><input type="file" accept="image/*" onChange={handlePicUpload} className="mt-4 text-sm" /></div>)}
          {activeTab==='support'&&(<div className="bg-white border rounded-xl p-4"><h3 className="font-bold">Welfare Support</h3><p className="text-sm mt-2">Emergency after 50% • Bereavement after 100% • You: {percent}%</p></div>)}
          {activeTab==='claims'&&(<div className="space-y-3"><div className="bg-white border rounded-xl p-4"><p className="font-bold mb-2">New Claim</p><input value={claimReason} onChange={e=>setClaimReason(e.target.value)} placeholder="Reason" className="w-full border p-2 rounded mb-2"/><input value={claimAmount} onChange={e=>setClaimAmount(e.target.value)} placeholder="Amount" type="number" className="w-full border p-2 rounded mb-2"/><button onClick={()=>{ if(!claimReason||!claimAmount) return alert('Enter reason & amount'); const newClaim={id:Date.now(),serviceNo:user.serviceNo,name:user.name,reason:claimReason,amount:Number(claimAmount),status:"Pending",date:new Date().toLocaleDateString()}; setClaims([newClaim,...claims]); addNotif("Claim Submitted",`Your claim for GHS ${claimAmount} (${claimReason}) is pending`,user.serviceNo); setClaimReason(""); setClaimAmount(""); alert('Claim submitted!'); }} className="w-full bg-green-800 text-white p-2 rounded font-bold">Submit</button></div><div className="bg-white border rounded-xl p-4"><p className="font-bold">My Claims</p>{claims.filter(c=>c.serviceNo===user.serviceNo).map(c=>(<div key={c.id} className="flex justify-between border-b py-2 text-sm"><span>{c.reason} - GHS {c.amount}</span><span className="bg-yellow-100 px-2 rounded text-xs">{c.status}</span></div>))}</div>{user.role==='admin'&&<div className="bg-white border rounded-xl p-4">{claims.map(c=>(<div key={c.id} className="flex justify-between border-b py-2 text-sm"><span>{c.serviceNo} - {c.reason} - GHS {c.amount}</span><div className="flex gap-1"><button onClick={()=>{ setClaims(claims.map(x=>x.id===c.id?{...x,status:'Approved'}:x)); addNotif("Claim Approved!",`Your claim ${c.reason} GHS ${c.amount} Approved`,c.serviceNo); }} className="bg-green-700 text-white px-2 rounded text-xs">Approve</button><button onClick={()=>{ setClaims(claims.map(x=>x.id===c.id?{...x,status:'Rejected'}:x)); addNotif("Claim Update",`Your claim ${c.reason} was Rejected`,c.serviceNo); }} className="bg-red-500 text-white px-2 rounded text-xs">Reject</button></div></div>))}</div>}</div>)}
          {activeTab==='contributions'&&(<div className="bg-white border rounded-xl p-4"><h3 className="font-bold mb-2">Contributions GHS {totalPaid}</h3>{myContribs.map((c,i)=>(<div key={i} className="flex justify-between border-b py-2 text-sm"><span>{c.month} • {c.date}</span><span className="font-bold">GHS {c.amount}</span></div>))}</div>)}
          {activeTab==='announcement'&&(<div className="space-y-3"><h3 className="font-bold text-lg">Announcement</h3>{user.role==='admin'&&<div className="bg-white border rounded-xl p-4"><input value={annTitle} onChange={e=>setAnnTitle(e.target.value)} placeholder="Title" className="w-full border p-2 rounded mb-2"/><textarea value={annBody} onChange={e=>setAnnBody(e.target.value)} placeholder="Message..." className="w-full border p-2 rounded mb-2" rows="3"></textarea><button onClick={()=>{ if(!annTitle||!annBody) return alert('Enter title & message'); const newA={id:Date.now(),title:annTitle,body:annBody,date:new Date().toLocaleDateString()}; setAnnouncements([newA,...announcements]); addNotif(`📢 ${annTitle}`,annBody,"ALL"); setAnnTitle(""); setAnnBody(""); alert('Posted + Notified ALL!'); }} className="w-full bg-green-800 text-white p-2 rounded font-bold">Post + Notify All</button></div>}<div className="bg-white border rounded-xl p-4">{announcements.map(a=>(<div key={a.id} className="border-b py-3"><p className="font-bold text-sm">{a.title} <span className="text-xs text-gray-500">{a.date}</span></p><p className="text-sm mt-1">{a.body}</p></div>))}</div></div>)}

          {activeTab==='admin'&&user.role==='admin'&&(
            <div className="space-y-4">
              <div className="bg-white border rounded-xl p-4 border-l-4 border-l-black">
                <h3 className="font-bold text-black mb-2">👑 ADD NEW ADMIN</h3>
                <div className="grid grid-cols-1 gap-2">
                  <input value={adminService} onChange={e=>setAdminService(e.target.value)} placeholder="GH/ADMIN002" className="border p-2 rounded uppercase" />
                  <input value={adminName} onChange={e=>setAdminName(e.target.value)} placeholder="Full Name e.g. John Mensah" className="border p-2 rounded" />
                  <input value={adminPass} onChange={e=>setAdminPass(e.target.value)} placeholder="Password e.g. admin002" className="border p-2 rounded" />
                  <button onClick={()=>{
                    if(!adminService||!adminName||!adminPass) return alert('Fill all 3 fields');
                    const sn=adminService.toUpperCase().trim();
                    if(members.find(m=>m.serviceNo===sn)) return alert('Already exists! Use different Service No');
                    const newAdmin={serviceNo:sn,name:adminName,phone:"",role:"admin",password:adminPass,totalPaid:0};
                    setMembers([...members,newAdmin]);
                    addNotif("New Admin Added",`${adminName} (${sn}) is now admin`,"ALL");
                    setAdminService(""); setAdminName(""); setAdminPass("");
                    alert(`${sn} added as ADMIN! Login: ${sn} / ${adminPass}`);
                  }} className="bg-black text-white rounded p-3 font-bold">+ Make Admin</button>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-bold text-green-800 mb-2">BULK IMPORT MEMBERS</h3>
                <input type="file" accept=".csv,.txt" onChange={handleBulkImport} className="w-full border p-2 rounded bg-gray-50" />
              </div>

              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-bold mb-3">Add Payment (Triggers Notification)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input value={addService} onChange={e=>setAddService(e.target.value)} placeholder="IS/13984" className="border p-2 rounded uppercase" />
                  <input value={addAmount} onChange={e=>setAddAmount(e.target.value)} placeholder="50" type="number" className="border p-2 rounded" />
                  <input value={addMonth} onChange={e=>setAddMonth(e.target.value)} placeholder="May 2026" className="border p-2 rounded col-span-2" />
                  <button onClick={()=>{ if(!addService||!addAmount) return alert('Enter service and amount'); const sn=addService.toUpperCase().trim(); const newC={serviceNo:sn,amount:Number(addAmount),month:addMonth,date:new Date().toLocaleDateString()}; setContributions([...contributions,newC]); addNotif("Payment Received! 💰",`GHS ${addAmount} credited for ${addMonth}. Thank you!`,sn); setAddService(""); setAddAmount(""); alert(`Added + Notified ${sn}`); }} className="bg-green-800 text-white rounded p-2 col-span-2 font-bold">Add + Notify Member</button>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-bold mb-2">All Members ({members.length}) - Admins: {members.filter(m=>m.role==='admin').length}</h3>
                <div className="max-h-[400px] overflow-auto text-sm">
                  {members.map((m,i)=>(
                    <div key={i} className="flex justify-between border-b py-2 items-center">
                      <span>{m.serviceNo} - {m.name} <span className={`text-[10px] px-1 rounded ${m.role==='admin'?'bg-black text-white':'bg-gray-200'}`}>{m.role}</span></span>
                      <div className="flex gap-1">
                        {m.role!=='admin'&&<button onClick={()=>{ setMembers(members.map(x=>x.serviceNo===m.serviceNo?{...x,role:'admin'}:x)); alert(`${m.serviceNo} promoted to admin`) }} className="bg-black text-white px-2 py-1 rounded text-[10px]">Make Admin</button>}
                        <span className="text-gray-500">GHS {contributions.filter(c=>c.serviceNo===m.serviceNo).reduce((a,b)=>a+Number(b.amount),0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 text-[11px]"><button onClick={()=>setActiveTab('dashboard')} className={activeTab==='dashboard'?'text-green-800 font-bold':''}>🏠<br/>Dash</button><button onClick={()=>setActiveTab('contributions')} className={activeTab==='contributions'?'text-green-800 font-bold':''}>💰<br/>Pay</button><button onClick={()=>setActiveTab('claims')} className={activeTab==='claims'?'text-green-800 font-bold':''}>📝<br/>Claims</button><button onClick={()=>setActiveTab('announcement')} className={activeTab==='announcement'?'text-green-800 font-bold':''}>📢<br/>News</button><button onClick={()=>setActiveTab('notifications')} className={`relative ${activeTab==='notifications'?'text-green-800 font-bold':''}`}>🔔{unread>0&&<span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">{unread}</span>}<br/>Alert</button></div>
    </div>
  );
}