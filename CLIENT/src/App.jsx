import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- ONLY ONE CONFIG - DO NOT DUPLICATE ---
const firebaseConfig = {
  apiKey: "AIzaSyCqBe_TY3I4istScWiohcM1r4LQfEY2a7g",
  authDomain: "wonjuga-portal.firebaseapp.com",
  projectId: "wonjuga-portal",
  storageBucket: "wonjuga-portal.firebasestorage.app",
  messagingSenderId: "1081629612681",
  appId: "1:1081629612681:web:ec07a5c82da1eb3f4a1f26"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [profilePic, setProfilePic] = useState(localStorage.getItem("wonjuga_pic") || "");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    onAuthStateChanged(auth, (u) => setUser(u));

    const unsub = onSnapshot(collection(db, "members"), (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id,...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const storageRef = ref(storage, `profiles/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    localStorage.setItem("wonjuga_pic", url);
    setProfilePic(url);
    await setDoc(doc(db, "members", auth.currentUser.uid), { photoURL: url }, { merge: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="flex justify-between items-center bg-white p-4 rounded shadow mb-4">
        <h1 className="font-bold text-xl">Wonjuga Welfare Portal</h1>
        <div className="flex items-center gap-3">
          <span>{greeting}, {user?.email}</span>
          <label className="cursor-pointer">
            <img src={profilePic || "https://via.placeholder.com/40"} alt="profile" className="w-10 h-10 rounded-full object-cover border" />
            <input type="file" hidden onChange={handleProfileUpload} accept="image/*" />
          </label>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">Members: {members.length}</div>
        <div className="bg-white p-4 rounded shadow">Contributions: Active</div>
        <div className="bg-white p-4 rounded shadow">Requests: {members.filter(m=>m.request).length}</div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-3">Members List</h2>
        {members.map(m => (
          <div key={m.id} className="flex justify-between items-center border-b py-2">
            <div className="flex items-center gap-2">
              <img src={m.photoURL || "https://via.placeholder.com/30"} className="w-8 h-8 rounded-full" alt="" />
              <span>{m.name || m.email}</span>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">💳 Make Payment</button>
              <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">🤲 Claims/Welfare</button>
              <button onClick={() => deleteDoc(doc(db, "members", m.id))} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <p>Fixed by Ezekiel - 26/09/2026</p>
      </div>
    </div>
  );
}
// Fixed by Ezekiel 26-09-2026 - FINAL
