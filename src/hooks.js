import { useEffect, useState } from 'react'
import { watchConnected } from './firebase.js'

/** 画面を消さない（対応端末のみ）。画面に戻った時にかけ直す */
export function useWakeLock(enabled = true) {
  const [active, setActive] = useState(false)
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return
    let lock = null
    let cancelled = false
    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
        setActive(true)
        lock.addEventListener('release', () => setActive(false))
      } catch (e) { setActive(false) }
    }
    const onVis = () => { if (document.visibilityState === 'visible' && !cancelled) request() }
    request()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVis)
      if (lock) lock.release().catch(() => {})
    }
  }, [enabled])
  return active
}

export function useConnected() {
  const [connected, setConnected] = useState(true)
  useEffect(() => {
    // 起動直後は一瞬 false になるので、少し待ってから反映
    let timer = null
    const stop = watchConnected((c) => {
      clearTimeout(timer)
      if (c) setConnected(true)
      else timer = setTimeout(() => setConnected(false), 3000)
    })
    return () => { clearTimeout(timer); stop() }
  }, [])
  return connected
}

/** 1秒ごとに再描画（「〇分前」の表示用） */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t) }, [ms])
  return now
}
