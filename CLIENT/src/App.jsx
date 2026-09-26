import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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

export default function App() {
  const [currentUser] = useState(JSON.parse(localStorage.getItem("wonjuga_user") || '{"name":"EZEKIEL ASOMANI","phone":"0548317382"}'));
  const [tab, setTab] = useState("dashboard");
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [amount, setAmount] = useState("");
  const [service, setService] = useState("");
  const [reason, setReason] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [pic, setPic] = useState(localStorage.getItem("wonjuga_pic") || "");
  const fileRef = useRef();

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "contributions"), s => setMembers(s.docs.map(d => ({ id: d.id,...d.data() }))));
    const unsub2 = onSnapshot(collection(db, "welfareRequests"), s => setRequests(s.docs.map(d => ({ id: d.id,...d.data() }))));
    return () => { unsub1(); unsub2(); };
  }, []);

  const totalAmount = members.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const pendingRequests = requests.filter(r => r.status === "Pending").length;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = ref(storage, `pics/${currentUser.phone}`);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    localStorage.setItem("wonjuga_pic", url);
    setPic(url);
    alert("Profile Picture Saved!");
  };

  const handleClaim = async () => {
    if (!selectedMember ||!reason) return alert("Enter reason");
    await addDoc(collection(db, "welfareRequests"), {
      name: selectedMember.name,
      phone: selectedMember.phone,
      service: service || selectedMember.rank || "Welfare",
      reason: reason,
      status: "Pending",
      date: serverTimestamp()
    });
    alert(`Welfare Claim Submitted for ${selectedMember.name}!`);
    setReason(""); setService(""); setSelectedMember(null); setTab("requests");
  };

  const handlePayment = async () => {
    if (!selectedMember ||!amount) return alert("Enter amount");
    await addDoc(collection(db, "welfareRequests"), {
      name: selectedMember.name,
      phone: selectedMember.phone,
      service: "Payment",
      amount: Number(amount),
      type: "Payment",
      status: "Approved",
      date: serverTimestamp()
    });
    alert(`Payment of GHS ${amount} recorded for ${selectedMember.name}!`);
    setAmount(""); setSelectedMember(null); setTab("dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "Arial", padding: 10 }}>
      {/* HEADER */}
      <div style={{ background: "white", padding: 15, display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 12, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div>
          <h2 style={{ margin: 0, color: "#0f172a" }}>Wonjuga Welfare Portal</h2>
          <small style={{ color: "#64748b" }}>GIS Staff Welfare System</small>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: "bold" }}>{getGreeting()}, {currentUser.name}</span>
          <img src={pic || "https://ui-avatars.com/api/?name=EZEKIEL+ASOMANI&background=22c55e&color=fff"} onClick={() => fileRef.current.click()} style={{ width: 45, height: 45, borderRadius: "50%", cursor: "pointer", border: "3px solid #22c55e" }} alt="pic" />
          <input type="file" ref={fileRef} onChange={handleUpload} accept="image/*" style={{ display: "none" }} />
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, margin: "15px 0" }}>
        <div onClick={() => setTab("dashboard")} style={{ background: tab === "dashboard"? "#dcfce7" : "white", padding: 20, borderRadius: 12, cursor: "pointer", border: tab === "dashboard"? "2px solid #22c55e" : "1px solid #e2e8f0", textAlign: "center" }}>
          <h3 style={{ margin: 0, fontSize: 28 }}>{members.length}</h3>
          <p style={{ margin: 0 }}>Members</p>
        </div>
        <div onClick={() => setTab("contributions")} style={{ background: "white", padding: 20, borderRadius: 12, cursor: "pointer", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <h3 style={{ margin: 0, fontSize: 28 }}>GHS {totalAmount}</h3>
          <p style={{ margin: 0 }}>Contributions 💰</p>
        </div>
        <div onClick={() => setTab("requests")} style={{ background: tab === "requests"? "#fef9c3" : "white", padding: 20, borderRadius: 12, cursor: "pointer", border: tab === "requests"? "2px solid #eab308" : "1px solid #e2e8f0", textAlign: "center" }}>
          <h3 style={{ margin: 0, fontSize: 28 }}>{requests.length} ({pendingRequests} Pending)</h3>
          <p style={{ margin: 0 }}>Welfare Requests</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ background: "white", padding: 15, borderRadius: 12, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 15, flexWrap: "wrap" }}>
          <button onClick={() => setTab("dashboard")} style={{ padding: "8px 16px", background: tab === "dashboard"? "#0f172a" : "#e2e8f0", color: tab === "dashboard"? "white" : "black", border: "none", borderRadius: 6, cursor: "pointer" }}>Dashboard</button>
          <button onClick={() => setTab("contributions")} style={{ padding: "8px 16px", background: tab === "contributions"? "#0f172a" : "#e2e8f0", color: tab === "contributions"? "white" : "black", border: "none", borderRadius: 6, cursor: "pointer" }}>Contributions</button>
          <button onClick={() => setTab("requests")} style={{ padding: "8px 16px", background: tab === "requests"? "#0f172a" : "#e2e8f0", color: tab === "requests"? "white" : "black", border: "none", borderRadius: 6, cursor: "pointer" }}>Welfare Claims</button>
        </div>

        {tab === "dashboard" && (
          <>
            <h3>Members List - {members.length} Found</h3>
            {members.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src={m.photoURL || `https://ui-avatars.com/api/?name=${m.name}&background=random`} style={{ width: 35, height: 35, borderRadius: "50%" }} alt="" />
                  <div>
                    <b>{m.name}</b><br />
                    <small style={{ color: "#64748b" }}>{m.rank || "AICO II"} • {m.phone} • {m.serviceNo || m.service || ""} {m.amount? `• GHS ${m.amount}` : ""}</small>
                  </div>
                </span>
                <span style={{ display: "flex", gap: 5 }}>
                  <button onClick={() => { setSelectedMember(m); setTab("claimForm"); }} style={{ background: "#3b82f6", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>🤲 Claims</button>
                  <button onClick={() => { setSelectedMember(m); setTab("paymentForm"); }} style={{ background: "#22c55e", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>💳 Payment</button>
                  <button onClick={async () => { if (confirm(`Delete ${m.name}?`)) await deleteDoc(doc(db, "contributions", m.id)); }} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>Delete</button>
                </span>
              </div>
            ))}
            {members.length === 0 && <p>No members found. Add members in Firebase contributions collection.</p>}
          </>
        )}

        {tab === "contributions" && (
          <>
            <h3>All Contributions - Total: GHS {totalAmount}</h3>
            {members.map(m => (
              <div key={m.id} style={{ padding: "10px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
                <span>{m.name} - {m.rank || ""}</span>
                <b>GHS {m.amount || 0}</b>
              </div>
            ))}
          </>
        )}

        {tab === "requests" && (
          <>
            <h3>Welfare Requests - {requests.length}</h3>
            {requests.map(r => (
              <div key={r.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <b>{r.name}</b> - {r.phone}<br />
                  <small>{r.service} {r.reason? `- ${r.reason}` : ""} {r.amount? `- GHS ${r.amount}` : ""}</small><br />
                  <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 12, background: r.status === "Pending"? "#fef9c3" : "#dcfce7", color: r.status === "Pending"? "#a16207" : "#15803d" }}>{r.status || "Pending"}</span>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button onClick={async () => await updateDoc(doc(db, "welfareRequests", r.id), { status: "Approved" })} style={{ background: "#22c55e", color: "white", border: "none", padding: "6px 10px", borderRadius: 6 }}>Approve</button>
                  <button onClick={async () => await deleteDoc(doc(db, "welfareRequests", r.id))} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 10px", borderRadius: 6 }}>Delete</button>
                </div>
              </div>
            ))}
            {requests.length === 0 && <p>No welfare requests yet.</p>}
          </>
        )}

        {tab === "claimForm" && selectedMember && (
          <div style={{ maxWidth: 400 }}>
            <h3>🤲 Welfare Claim for {selectedMember.name}</h3>
            <input placeholder="Service Type" value={service} onChange={e => setService(e.target.value)} style={{ width: "100%", padding: 10, margin: "8px 0", border: "1px solid #ccc", borderRadius: 6 }} />
            <textarea placeholder="Reason for claim" value={reason} onChange={e => setReason(e.target.value)} style={{ width: "100%", padding: 10, margin: "8px 0", border: "1px solid #ccc", borderRadius: 6, height: 80 }}></textarea>
            <button onClick={handleClaim} style={{ width: "100%", padding: 12, background: "#3b82f6", color: "white", border: "none", borderRadius: 6, fontWeight: "bold" }}>Submit Claim</button>
            <button onClick={() => setTab("dashboard")} style={{ width: "100%", padding: 10, background: "#e2e8f0", border: "none", borderRadius: 6, marginTop: 8 }}>Cancel</button>
          </div>
        )}

        {tab === "paymentForm" && selectedMember && (
          <div style={{ maxWidth: 400 }}>
            <h3>💳 Payment for {selectedMember.name}</h3>
            <p>Phone: {selectedMember.phone}</p>
            <input type="number" placeholder="Amount GHS" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: "100%", padding: 10, margin: "8px 0", border: "1px solid #ccc", borderRadius: 6 }} />
            <input placeholder="Service (optional)" value={service} onChange={e => setService(e.target.value)} style={{ width: "100%", padding: 10, margin: "8px 0", border: "1px solid #ccc", borderRadius: 6 }} />
            <button onClick={handlePayment} style={{ width: "100%", padding: 12, background: "#22c55e", color: "white", border: "none", borderRadius: 6, fontWeight: "bold" }}>💳 Record Payment</button>
            <button onClick={() => setTab("dashboard")} style={{ width: "100%", padding: 10, background: "#e2e8f0", border: "none", borderRadius: 6, marginTop: 8 }}>Cancel</button>
          </div>
        )}
      </div>

      <p style={{ textAlign: "center", marginTop: 20, color: "#64748b" }}>GIS-WONJUGA WELFARE • Fixed by Ezekiel • 26/09/2026 • Members: {members.length} • Connected ✅</p>
    </div>
  );
}
