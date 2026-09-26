import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- CORRECT PROJECT gis-wonjuga-welfare ---
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
  const [currentUser] = useState(JSON.parse(localStorage.getItem("wonjuga_user") || '{"name":"EZEKIEL ASOMANI"}'));
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pic, setPic] = useState(localStorage.getItem("wonjuga_pic") || "");
  const [tab, setTab] = useState("dashboard");
  const fileRef = useRef();

  useEffect(() => {
    // YOUR MEMBERS ARE INSIDE contributions COLLECTION
    const unsub1 = onSnapshot(collection(db, "contributions"), s => {
      setMembers(s.docs.map(d => ({ id: d.id,...d.data() })));
    });
    const unsub2 = onSnapshot(collection(db, "welfareRequests"), s => {
      setRequests(s.docs.map(d => ({ id: d.id,...d.data() })));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = ref(storage, `pics/${currentUser.phone || "0548317382"}`);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    localStorage.setItem("wonjuga_pic", url);
    setPic(url);
    alert("Profile Picture Saved!");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: 10 }}>
      <div style={{ background: "white", padding: 15, display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 8 }}>
        <h3>Wonjuga Welfare Portal</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>{getGreeting()}, {currentUser.name}</span>
          <img src={pic || "https://via.placeholder.com/40"} onClick={() => fileRef.current.click()} style={{ width: 40, height: 40, borderRadius: "50%", cursor: "pointer", border: "2px solid green" }} alt="pic" />
          <input type="file" ref={fileRef} onChange={handleUpload} accept="image/*" style={{ display: "none" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, margin: "15px 0" }}>
        <div onClick={() => setTab("dashboard")} style={{ flex: 1, background: "white", padding: 15, borderRadius: 8, cursor: "pointer", border: tab === "dashboard"? "2px solid green" : "1px solid #ddd" }}>Members: {members.length}</div>
        <div style={{ flex: 1, background: "white", padding: 15, borderRadius: 8 }}>Contributions: {members.length} 💰</div>
        <div onClick={() => setTab("requests")} style={{ flex: 1, background: "white", padding: 15, borderRadius: 8, cursor: "pointer" }}>Requests: {requests.length}</div>
      </div>

      <div style={{ background: "white", padding: 15, borderRadius: 8 }}>
        <h4>Members List - {members.length} Found</h4>
        {members.length === 0 && <p>Loading members from gis-wonjuga-welfare...</p>}
        {members.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src={m.photoURL || "https://via.placeholder.com/30"} style={{ width: 30, height: 30, borderRadius: "50%" }} alt="" />
              <b>{m.name}</b> - {m.rank || m.serviceNo || m.service} - {m.phone}
            </span>
            <span>
              <button style={{ background: "#007bff", color: "white", border: "none", padding: "5px 10px", borderRadius: 4, marginRight: 5 }}>🤲 Claims</button>
              <button style={{ background: "green", color: "white", border: "none", padding: "5px 10px", borderRadius: 4, marginRight: 5 }}>💳 Payment</button>
              <button onClick={async () => { if (confirm("Delete " + m.name + "?")) await deleteDoc(doc(db, "contributions", m.id)) }} style={{ background: "red", color: "white", border: "none", padding: "5px 10px", borderRadius: 4 }}>Delete</button>
            </span>
          </div>
        ))}
      </div>

      {tab === "requests" && (
        <div style={{ background: "white", padding: 15, borderRadius: 8, marginTop: 15 }}>
          <h4>Welfare Requests</h4>
          {requests.map(r => (
            <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>{r.name} - {r.service || r.amount}</div>
          ))}
        </div>
      )}
      <p style={{ textAlign: "center", marginTop: 20 }}>Fixed by Ezekiel - 26/09/2026 - GIS-WONJUGA CONNECTED ✅</p>
    </div>
  );
}
