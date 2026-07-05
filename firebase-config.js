// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyClCRUp9qqJ1dPR_hCG5zxKG_T5ypVGXqc",
  authDomain: "advocate-pratibha-yadav.firebaseapp.com",
  databaseURL: "https://advocate-pratibha-yadav-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "advocate-pratibha-yadav",
  storageBucket: "advocate-pratibha-yadav.firebasestorage.app",
  messagingSenderId: "737527211054",
  appId: "1:737527211054:web:55ac7b0559983ac20d2bbf",
  measurementId: "G-J7GD1Y9E70"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Realtime Database
const database = firebase.database();
