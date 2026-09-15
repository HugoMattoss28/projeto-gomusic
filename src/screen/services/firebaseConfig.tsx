// Inicialização da conexão com Firebase
import { initializeApp } from "firebase/app";
// Inicializa a conexão com o banco de dados em tempo real do Firebase
import { getDatabase } from "firebase/database";
// Inicializa com a autenticação do Firebase
import { initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAsego6ysz3kwmtqi4W4XZZl-d4syCf8XU",
  authDomain: "gomusic-6fe3a.firebaseapp.com",
  projectId: "gomusic-6fe3a",
  storageBucket: "gomusic-6fe3a.firebasestorage.app",
  messagingSenderId: "587391904037",
  appId: "1:587391904037:web:5c5891cdd49954557dd2cc",
  databaseURL: "https://gomusic-6fe3a-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = initializeAuth(app);

// Realtime Database
export const database = getDatabase(app);

export default app;