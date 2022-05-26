import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBC37OtCVKtNKOpCxz1tqRTAa2aowNvKpc",
  authDomain: "swc-traders.firebaseapp.com",
  projectId: "swc-traders",
  storageBucket: "swc-traders.appspot.com",
  messagingSenderId: "921956659132",
  appId: "1:921956659132:web:6388857c1748df7e1e05b9",
  measurementId: "G-SDF9NYM4MR",
  // apiKey: "AIzaSyAA2ezotwfyIZ7hUIBaIuUI3gfljqhr-ec",
  // authDomain: "swrc-traders.firebaseapp.com",
  // projectId: "swrc-traders",
  // storageBucket: "swrc-traders.appspot.com",
  // messagingSenderId: "405687733001",
  // appId: "1:405687733001:web:f723bfebca534a87a5e1d8",
  // measurementId: "G-YBHP5Z568J",
};

const fireApp = initializeApp(firebaseConfig);
export const firedb = getFirestore(fireApp);
