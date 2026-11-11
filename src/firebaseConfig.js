// Firebase コンソール →「プロジェクトの設定」→「マイアプリ」に出る firebaseConfig の値をここに貼る。
// これはパスワードではなく、公開される前提の値。データはデータベースのルール（database.rules.json）で守る。
// （ここが空なら、ビルド時の環境変数 VITE_FIREBASE_〇〇 を使う）
const env = import.meta.env

export const firebaseConfig = {
  apiKey: '' || env.VITE_FIREBASE_API_KEY,
  authDomain: '' || env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: '' || env.VITE_FIREBASE_DATABASE_URL,
  projectId: '' || env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: '' || env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: '' || env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: '' || env.VITE_FIREBASE_APP_ID
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL)

// 手元のテスト用（Firebase エミュレーター）。本番では使わない
export const useEmulator = env.VITE_USE_EMULATOR === '1'
