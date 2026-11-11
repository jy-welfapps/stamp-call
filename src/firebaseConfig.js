// Firebase コンソール →「プロジェクトの設定」→「マイアプリ」に出る firebaseConfig の値をここに貼る。
// これはパスワードではなく、公開される前提の値。データはデータベースのルール（database.rules.json）で守る。
// databaseURL は Realtime Database をシンガポール（asia-southeast1）で作った時の URL。
// （ここが空なら、ビルド時の環境変数 VITE_FIREBASE_〇〇 を使う）
const env = import.meta.env

export const firebaseConfig = {
  apiKey: 'AIzaSyBJxjT7xBYyDqJrnoqQ7JTp1jSI_zFUOxw' || env.VITE_FIREBASE_API_KEY,
  authDomain: 'stamp-call.firebaseapp.com' || env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: 'https://stamp-call-default-rtdb.asia-southeast1.firebasedatabase.app' || env.VITE_FIREBASE_DATABASE_URL,
  projectId: 'stamp-call' || env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: 'stamp-call.firebasestorage.app' || env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: '155778057648' || env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: '1:155778057648:web:cb614ab74d16534faf4275' || env.VITE_FIREBASE_APP_ID
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL)

// 手元のテスト用（Firebase エミュレーター）。本番では使わない
export const useEmulator = env.VITE_USE_EMULATOR === '1'
