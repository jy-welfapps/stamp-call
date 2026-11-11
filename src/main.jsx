import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(<App />)

// 新しい版が出たら自動で入れ替える（ホーム画面のアプリは開きっぱなしになりやすいので、
// 画面に戻った時と1時間ごとに確認する）
import { registerSW } from 'virtual:pwa-register'
registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (!reg) return
    const check = () => reg.update().catch(() => {})
    setInterval(check, 60 * 60 * 1000)
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check() })
  }
})
