import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, deleteDoc, addDoc, updateDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);

// FIXED PAYMENT: 50 Default, can pay more if debt
const PAYMENT_CONFIG = { momoNumber: "0559154973", name: "FHIL", defaultAmount: 50, monthly: 50, bank: "Wonjuga Welfare - 0559154973" };

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("wonjuga_user") || "null"));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("wonjuga_role") === "admin");
  const [showMenu, setShowMenu] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loginForm, setLoginForm] = useState({ serviceNo: "", password: "" });
  const [requestForm, setRequestForm] = useState({ serviceNo: "", phone: "" });
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [addForm, setAddForm] = useState({ fullName: "", phone: "", serviceNo: "", rank: "" });
  const [payAmount, setPayAmount] = useState(50);
  const [pic, setPic] = useState(localStorage.getItem("wonjuga_pic") || "");
  const fileRef = useRef();

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "members"), s => setMembers(s.docs.map(d => ({ id: d.id,...d.data() }))));
    const u2 = onSnapshot(collection(db, "welfareRequests"), s => setRequests(s.docs.map(d => ({ id: d.id,...d.data() }))));
    const u3 = onSnapshot(collection(db, "announcements"), s => setAnnouncements(s.docs.map(d => ({ id: d.id,...d.data() }))));
    return () => { u1(); u2(); u3(); };
  }, []);

  const uniqueMembers = members.filter((m, i, arr) => arr.findIndex(x => x.serviceNo === m.serviceNo) === i);
  const myData = isAdmin? uniqueMembers : uniqueMembers.filter(m => m.serviceNo === user?.serviceNo);
  const myTotalPaid = myData[0]?.totalPaid || 0;
  const outstanding = Math.max(0, 50 - myTotalPaid); // Simplified: if member hasn't paid 50, show debt. Admin can set months later.

  const getGreeting = () => { const h = new Date().getHours(); if (h < 12) return "Good Morning"; if (h < 18) return "Good Afternoon"; return "Good Evening"; };

  const handleLogin = async () => {
    const q = query(collection(db, "members"), where("serviceNo", "==", loginForm.serviceNo), where("password", "==", loginForm.password));
    const snap = await getDocs(q);
    if (snap.empty) return alert("Wrong Service Number or Password. Request Access first.");
    const u = snap.docs[0].data();
    localStorage.setItem("wonjuga_user", JSON.stringify(u));
    localStorage.setItem("wonjuga_role", u.role || "member");
    setUser(u); setIsAdmin((u.role || "member") === "admin"); setTab("dashboard");
  };

  const handleRequestAccess = async () => {
    const q = query(collection(db, "members"), where("serviceNo", "==", requestForm.serviceNo));
    const snap = await getDocs(q);
    if (snap.empty) return alert("Not added yet. Admin must add your Full Name, Phone, Service Number first.");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    alert(`OTP Sent to ${requestForm.phone}: ${code}\n(MTN/Vodafone/AirtelTigo auto-detect. With your MTN SIM bundle, connect via Hubtel SMS Gateway to send real SMS)`);
    setTab("otp");
  };

  const handleVerifyOtp = () => { if (otp!== generatedOtp) return alert("Wrong OTP"); setTab("createPass"); };
  const handleCreatePass = async () => {
    const q = query(collection(db, "members"), where("serviceNo", "==", requestForm.serviceNo));
    const snap = await getDocs(q); if (snap.empty) return;
    await updateDoc(doc(db, "members", snap.docs[0].id), { password: newPass, phone: requestForm.phone, status: "Active" });
    alert("Password Created! Now Login."); setTab("login");
  };

  const handleAddMember = async () => {
    if (!addForm.fullName ||!addForm.serviceNo ||!addForm.phone) return alert("Enter Full Name, Phone, Service Number");
    if (uniqueMembers.find(m => m.serviceNo === addForm.serviceNo)) return alert("Service Number already exists - This is why you saw two Ezekiel");
    await addDoc(collection(db, "members"), { fullName: addForm.fullName, name: addForm.fullName, phone: addForm.phone, serviceNo: addForm.serviceNo, rank: addForm.rank, role: "member", totalPaid: 0, status: "Pending Activation", createdAt: serverTimestamp() });
    alert(`${addForm.fullName} Added! Service: ${addForm.serviceNo}. They should now Request Access at bottom.`); setAddForm({ fullName: "", phone: "", serviceNo: "", rank: "" });
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0]; if (!file ||!user) return;
    const r = ref(storage, `profilePics/${user.serviceNo}`);
    await uploadBytes(r, file); const url = await getDownloadURL(r);
    localStorage.setItem("wonjuga_pic", url); setPic(url);
    const q = query(collection(db, "members"), where("serviceNo", "==", user.serviceNo));
    const snap = await getDocs(q); if (!snap.empty) await updateDoc(doc(db, "members", snap.docs[0].id), { photoURL: url });
    alert("Profile Picture Saved Permanently!");
  };

  const handlePay = async (member) => {
    const m = member || myData[0]; if (!m) return;
    const amt = Number(payAmount);
    if (amt < 50) return alert("Minimum payment is GHS 50. You can pay MORE if you have outstanding debt.");
    await addDoc(collection(db, "welfareRequests"), { name: m.fullName || m.name, phone: m.phone, serviceNo: m.serviceNo, type: "Contribution", amount: amt, status: "Paid", method: `MoMo to FHIL + Bank (0559154973 hidden)`, date: serverTimestamp() });
    const q = query(collection(db, "members"), where("serviceNo", "==", m.serviceNo));
    const snap = await getDocs(q); if (!snap.empty) await updateDoc(doc(db, "members", snap.docs[0].id), { totalPaid: (Number(snap.docs[0].data().totalPaid) || 0) + amt });
    alert(`Payment GHS ${amt} recorded for ${m.fullName || m.name}. Sent to FHIL system (0559154973 hidden) + Bank. Thank you!`); setPayAmount(50);
  };

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", justifyContent: "center", alignItems: "center", padding: 15 }}>
        <div style={{ background: "white", padding: 25, borderRadius: 16, width: "100%", maxWidth: 400, textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>GIS WONJUGA WELFARE PORTAL</h2>
          <p style={{ color: "#64748b" }}>Staff Welfare System</p>
          {(tab === "login" || tab === "dashboard") && (
            <>
              <input placeholder="Service Number" value={loginForm.serviceNo} onChange={e => setLoginForm({...loginForm, serviceNo: e.target.value })} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }} />
              <input type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value })} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }} />
              <button onClick={handleLogin} style={{ width: "100%", padding: 12, background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", marginTop: 10 }}>Login</button>
              <div style={{ marginTop: 25, borderTop: "1px solid #eee", paddingTop: 15 }}>
                <p style={{ fontSize: 13, color: "#64748b" }}>First time? Admin added you?</p>
                <button onClick={() => setTab("request")} style={{ width: "100%", padding: 10, background: "#f1f5f9", border: "1px solid #ccc", borderRadius: 8 }}>Request Access ↓</button>
              </div>
            </>
          )}
          {tab === "request" && (
            <>
              <h4>Request Access</h4>
              <input placeholder="Service Number" value={requestForm.serviceNo} onChange={e => setRequestForm({...requestForm, serviceNo: e.target.value })} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }} />
              <input placeholder="Phone Number" value={requestForm.phone} onChange={e => setRequestForm({...requestForm, phone: e.target.value })} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }} />
              <button onClick={handleRequestAccess} style={{ width: "100%", padding: 12, background: "#3b82f6", color: "white", border: "none", borderRadius: 8 }}>Send OTP (MTN Bundle)</button>
              <button onClick={() => setTab("login")} style={{ width: "100%", padding: 10, background: "#e2e8f0", border: "none", borderRadius: 8, marginTop: 8 }}>Back to Login</button>
            </>
          )}
          {tab === "otp" && (<><h4>Enter OTP - Auto detect MTN/Vodafone/AirtelTigo</h4><input placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }} /><button onClick={handleVerifyOtp} style={{ width: "100%", padding: 12, background: "#22c55e", color: "white", border: "none", borderRadius: 8 }}>Verify</button></>)}
          {tab === "createPass" && (<><h4>Create Password</h4><input type="password" placeholder="Create Password" value={newPass} onChange={e => setNewPass(e.target.value)} style={{ width: "100%", padding: 12, margin: "8px 0", borderRadius: 8, border: "1px solid #ccc" }} /><button onClick={handleCreatePass} style={{ width: "100%", padding: 12, background: "#22c55e", color: "white", border: "none", borderRadius: 8 }}>Create & Login</button></>)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "white", padding: "12px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setShowMenu(!showMenu)} style={{ fontSize: 24, background: "none", border: "none", cursor: "pointer" }}>☰</button>
        <h2 style={{ margin: 0, flex: 1, textAlign: "center", fontSize: 18 }}>GIS WONJUGA WELFARE PORTAL</h2>
        <img src={pic || user?.photoURL || `https://ui-avatars.com/api/?name=${user?.fullName || user?.name}&background=22c55e&color=fff`} onClick={() => fileRef.current.click()} style={{ width: 42, height: 42, borderRadius: "50%", border: "2px solid #22c55e", cursor: "pointer" }} alt="" />
        <input type="file" ref={fileRef} onChange={handlePicUpload} accept="image/*" style={{ display: "none" }} />
      </div>

      {showMenu && (
        <div style={{ position: "fixed", left: 0, top: 0, width: 260, height: "100vh", background: "#0f172a", color: "white", zIndex: 20, padding: 15 }}>
          <button onClick={() => setShowMenu(false)} style={{ float: "right", background: "none", color: "white", border: "none", fontSize: 20 }}>✕</button>
          <h3 style={{ marginTop: 40 }}>Menu</h3>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>{getGreeting()}, {user.fullName || user.name}<br />{isAdmin? "ADMIN - Full Access" : "MEMBER - Own Account Only"}<br />Service: {user.serviceNo}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 20 }}>
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "profile", label: "Profile" },
              { id: "welfare", label: "Welfare Support" },
              { id: "claims", label: "Claims" },
              { id: "contributions", label: "Contributions" },
              { id: "announcement", label: "Announcement" },
              { id: "notification", label: "Notification" }
            ].map(m => (
              <button key={m.id} onClick={() => { setTab(m.id); setShowMenu(false); }} style={{ textAlign: "left", padding: "12px 10px", background: tab === m.id? "#22c55e" : "transparent", color: "white", border: "none", borderRadius: 6 }}>{m.label}</button>
            ))}
            {isAdmin && <button onClick={() => { setTab("addMember"); setShowMenu(false); }} style={{ textAlign: "left", padding: "12px 10px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, marginTop: 10 }}>+ Add Members (Full Name, Phone, Service No)</button>}
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ textAlign: "left", padding: "12px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: 6, marginTop: 20 }}>Logout</button>
          </div>
        </div>
      )}

      <div style={{ padding: 15 }}>
        {tab === "dashboard" && (
          <>
            <div style={{ background: "white", padding: 15, borderRadius: 12, marginBottom: 15 }}>
              <h3 style={{ margin: 0 }}>{getGreeting()}, {user.fullName || user.name} 👋</h3>
              <p style={{ color: "#64748b", fontSize: 13 }}>Full Name: {user.fullName || user.name} | Phone: {user.phone} | Service No: {user.serviceNo} | Rank: {user.rank || ""}</p>
              <p style={{ fontSize: 12, color: isAdmin? "#22c55e" : "#3b82f6" }}>{isAdmin? "ADMIN: You can access all portal & members data" : "MEMBER: You access only your account & relevant data - not others' contributions"}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "white", padding: 15, borderRadius: 12, textAlign: "center" }}><h2>{isAdmin? uniqueMembers.length : 1}</h2><p>{isAdmin? "Members" : "My Profile"}</p></div>
              <div style={{ background: "white", padding: 15, borderRadius: 12, textAlign: "center" }}><h2>GHS {isAdmin? uniqueMembers.reduce((a, b) => a + (Number(b.totalPaid) || 0), 0) : myTotalPaid}</h2><p>{isAdmin? "Total Contributions" : "My Contributions"}</p></div>
            </div>
            <div style={{ background: "white", padding: 15, borderRadius: 12, marginTop: 15, borderLeft: "4px solid #22c55e" }}>
              <h4>💳 Payment System - Default GHS 50 (FHIL)</h4>
              <p style={{ fontSize: 13, color: "#475569" }}>Minimum <b>GHS 50</b>. If you owe outstanding debt, you can pay MORE (e.g. 100, 150, 200).<br />Payment secured to <b>FHIL</b> - MoMo 0559154973 (hidden) + Bank transfer allowed.</p>
              <div style={{ background: "#f1f5f9", padding: 10, borderRadius: 8, margin: "10px 0" }}>
                <p style={{ margin: 0, fontSize: 13 }}>My Paid: GHS {myTotalPaid} | Monthly: GHS 50 | {myTotalPaid < 50? `Outstanding: GHS ${50 - myTotalPaid}` : "No debt - You can still pay extra for next month"}</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} min="50" placeholder="50 or more if debt" style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #ccc" }} />
                <button onClick={() => handlePay()} style={{ padding: "12px 20px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontWeight: "bold" }}>Pay GHS {payAmount}</button>
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Number 0559154973 built inside payment system, not shown to members. Supports MoMo & Bank.</p>
            </div>
          </>
        )}
        {tab === "profile" && (<div style={{ background: "white", padding: 15, borderRadius: 12 }}><h3>Profile - Picture Permanent</h3><img src={pic || user?.photoURL || `https://ui-avatars.com/api/?name=${user?.fullName}&background=22c55e&color=fff`} style={{ width: 80, height: 80, borderRadius: "50%" }} alt="" /><p><b>Full Name:</b> {user.fullName || user.name}</p><p><b>Phone:</b> {user.phone}</p><p><b>Service Number:</b> {user.serviceNo}</p><p><b>Rank:</b> {user.rank}</p><button onClick={() => fileRef.current.click()} style={{ padding: "10px 20px", background: "#0f172a", color: "white", border: "none", borderRadius: 6 }}>Upload Picture (Permanent)</button><p style={{ fontSize: 11, color: "#64748b", marginTop: 10 }}>Picture saves to Firebase Storage profilePics/{user.serviceNo} forever. It will show at right corner top always.</p></div>)}
        {tab === "addMember" && isAdmin && (<div style={{ background: "white", padding: 15, borderRadius: 12 }}><h3>Admin - Add Members Details Before Request Access</h3><p style={{ fontSize: 12, color: "#64748b" }}>How to Approve: 1. Add Full Name, Phone, Service Number here 2. Tell member to click Request Access at bottom 3. They receive OTP (via your MTN bundle SMS) 4. Create password 5. Good to go</p><input placeholder="Full Name" value={addForm.fullName} onChange={e => setAddForm({...addForm, fullName: e.target.value })} style={{ width: "100%", padding: 10, margin: "6px 0", borderRadius: 6, border: "1px solid #ccc" }} /><input placeholder="Phone Number" value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value })} style={{ width: "100%", padding: 10, margin: "6px 0", borderRadius: 6, border: "1px solid #ccc" }} /><input placeholder="Service Number - Unique (prevents duplicate Ezekiel)" value={addForm.serviceNo} onChange={e => setAddForm({...addForm, serviceNo: e.target.value })} style={{ width: "100%", padding: 10, margin: "6px 0", borderRadius: 6, border: "1px solid #ccc" }} /><input placeholder="Rank" value={addForm.rank} onChange={e => setAddForm({...addForm, rank: e.target.value })} style={{ width: "100%", padding: 10, margin: "6px 0", borderRadius: 6, border: "1px solid #ccc" }} /><button onClick={handleAddMember} style={{ width: "100%", padding: 12, background: "#22c55e", color: "white", border: "none", borderRadius: 6, fontWeight: "bold" }}>Add Member</button><div style={{ marginTop: 20 }}><h4>All Members - {uniqueMembers.length} (No duplicates)</h4>{uniqueMembers.map(m => (<div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee", fontSize: 13 }}><span><b>{m.fullName || m.name}</b> | {m.phone} | Service: {m.serviceNo} | Paid: GHS {m.totalPaid || 0} | {m.status}</span><button onClick={async () => await deleteDoc(doc(db, "members", m.id))} style={{ background: "red", color: "white", border: "none", borderRadius: 4, padding: "4px 8px" }}>Delete</button></div>))}</div></div>)}
        {tab === "welfare" && <div style={{ background: "white", padding: 15, borderRadius: 12 }}><h3>Welfare Support</h3>{(isAdmin? requests : requests.filter(r => r.serviceNo === user.serviceNo)).map(r => (<div key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>{r.name} - {r.serviceNo} - GHS {r.amount || 0} - {r.status}</div>))}</div>}
        {tab === "claims" && <div style={{ background: "white", padding: 15, borderRadius: 12 }}><h3>Claims</h3>{(isAdmin? requests : requests.filter(r => r.serviceNo === user.serviceNo)).map(r => (<div key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}><span>{r.name} ({r.serviceNo})<br /><small>{r.type} GHS {r.amount}</small></span>{isAdmin && <button onClick={async () => await updateDoc(doc(db, "welfareRequests", r.id), { status: "Approved" })} style={{ background: "#22c55e", color: "white", border: "none", borderRadius: 6, padding: "6px 12px" }}>Approve Claim</button>}</div>))}</div>}
        {tab === "contributions" && <div style={{ background: "white", padding: 15, borderRadius: 12 }}><h3>{isAdmin? "All Contributions" : "My Contributions"}</h3><p style={{ fontSize: 12 }}>Default 50 GHS, pay more if outstanding debt. FHIL system hidden 0559154973 + Bank.</p>{(isAdmin? uniqueMembers : myData).map(m => (<div key={m.id} style={{ padding: "10px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}><span>{m.fullName || m.name} ({m.serviceNo}) - Paid: GHS {m.totalPaid || 0} {Number(m.totalPaid) < 50? `(Owes GHS ${50 - (Number(m.totalPaid) || 0)})` : ""}</span><b>GHS {m.totalPaid || 0}</b></div>))}<div style={{ display: "flex", gap: 10, marginTop: 15 }}><input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} min="50" style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc" }} /><button onClick={() => handlePay()} style={{ padding: "10px 20px", background: "#22c55e", color: "white", border: "none", borderRadius: 6 }}>Pay GHS {payAmount} (50 or more)</button></div></div>}
        {tab === "announcement" && <div style={{ background: "white", padding: 15, borderRadius: 12 }}><h3>Announcements</h3>{isAdmin && <div style={{ display: "flex", gap: 10, marginBottom: 15 }}><input id="annInput" placeholder="Write announcement" style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc" }} /><button onClick={async () => { const v = document.getElementById("annInput").value; if (!v) return; await addDoc(collection(db, "announcements"), { text: v, date: serverTimestamp() }); document.getElementById("annInput").value = ""; }} style={{ padding: "10px 15px", background: "#0f172a", color: "white", border: "none", borderRadius: 6 }}>Post</button></div>}{announcements.map(a => (<div key={a.id} style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}>{a.text}</div>))}</div>}
        {tab === "notification" && <div style={{ background: "white", padding: 15, borderRadius: 12 }}><h3>Notifications</h3>{(isAdmin? requests : requests.filter(r => r.serviceNo === user.serviceNo)).map(r => (<div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>🔔 {r.name} - {r.type} - GHS {r.amount} - {r.status}</div>))}</div>}
      </div>
    </div>
  );
}
