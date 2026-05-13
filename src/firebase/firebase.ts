import { getApp, getApps, initializeApp } from "firebase/app"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? ""
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

const resolvedFirebaseConfig = isFirebaseConfigured
  ? firebaseConfig
  : {
      apiKey: "demo-api-key",
      authDomain: "mirost-demo.firebaseapp.com",
      projectId: "mirost-demo",
      storageBucket: "mirost-demo.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:mirostdemo"
    }

if (!isFirebaseConfigured && import.meta.env.DEV) {
  console.warn("Firebase env variables are missing. MIROST is running in local demo mode.")
}

export const app = getApps().length ? getApp() : initializeApp(resolvedFirebaseConfig)
