import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBBM0cFhDgs15CGxZN2SYA3GldQBcd5UCQ",
  authDomain: "note-app-19-19e8d.firebaseapp.com",
  projectId: "note-app-19-19e8d",
  storageBucket: "note-app-19-19e8d.firebasestorage.app",
  messagingSenderId: "95421581570",
  appId: "1:95421581570:web:4330305897c3920c5bda1b"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };