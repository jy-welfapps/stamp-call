import { useEffect, useRef, useState } from 'react'
import config from './config/stamps.json'
import { joinRoom, sendStamp, watchStamp } from './firebase.js'
import { playSent, playSeen, unlockAudio, vibrate } from './sound.js'
import { useConnected } from './hooks.js'
import { StampArt } from './stampView.jsx'
import HiddenExit from './HiddenExit.jsx'

const COOLDOWN = (config.cooldownSeconds || 3) * 1000

export default function Child({ settings, onExit }) {
  const device = config.devices.find((d) => d.id === settings.deviceId) || config.devices[0]
  const set = config.sets.find((s) => s.id === settings.setId) || config.sets[0]
  const stamps = set.stamps.map((id) => ({ id, ...config.stamps[id] })).filter((s) => s.label)

  const [ready, setReady] = useState(false)
  const [glow, setGlow] = useState(null)          // 光らせる色
  const [coolUntil, setCoolUntil] = useState(0)
  const [last, setLast] = useState(null)          // { key, stamp, status: 'sending'|'sent'|'seen'|'failed' }
  const connected = useConnected()
  const stopWatch = useRef(null)

  useEffect(() => {
    joinRoom(settings.room).then(() => setReady(true)).catch(() => setReady(true))
    return () => stopWatch.current && stopWatch.current()
  }, [settings.room])

  useEffect(() => {
    if (!coolUntil) return
    const t = setTimeout(() => setCoolUntil(0), coolUntil - Date.now())
    return () => clearTimeout(t)
  }, [coolUntil])

  // 「せんせいが みたよ」は 15秒で消す
  useEffect(() => {
    if (last?.status !== 'seen') return
    const t = setTimeout(() => setLast(null), 15000)
    return () => clearTimeout(t)
  }, [last?.status])

  const press = async (stamp) => {
    if (Date.now() < coolUntil) return
    unlockAudio()
    setCoolUntil(Date.now() + COOLDOWN)
    setGlow(stamp.color || '#fff3bf')
    setTimeout(() => setGlow(null), 1200)
    playSent(); vibrate(80)
    if (stopWatch.current) { stopWatch.current(); stopWatch.current = null }
    setLast({ key: null, stamp, status: 'sending' })
    // ネットが遅い時は8秒で「おくれなかった」
    let done = false
    const slow = setTimeout(() => { if (!done) setLast((l) => (l && l.stamp === stamp && l.status === 'sending' ? { ...l, status: 'failed' } : l)) }, 8000)
    try {
      const key = await sendStamp(settings.room, stamp.id, device)
      done = true; clearTimeout(slow)
      setLast({ key, stamp, status: 'sent' })
      stopWatch.current = watchStamp(settings.room, key, (v) => {
        if (v && v.seenAt) {
          setLast((l) => (l && l.key === key && l.status !== 'seen' ? { ...l, status: 'seen' } : l))
          playSeen()
          if (stopWatch.current) { stopWatch.current(); stopWatch.current = null }
        }
      })
    } catch (e) {
      done = true; clearTimeout(slow)
      console.error(e)
      setLast({ key: null, stamp, status: 'failed' })
    }
  }

  const cooling = Date.now() < coolUntil

  return (
    <div className="child" style={{ '--device': device.color }}>
      <HiddenExit onExit={onExit} />
      <header className="child-head">
        <span className="device-badge" style={{ background: device.color }}>{device.icon}</span>
        {!connected && <span className="offline">つながっていません</span>}
      </header>

      <main className={'grid cols-' + (set.columns || 3)} style={{ gridTemplateColumns: `repeat(${set.columns || 3}, 1fr)` }}>
        {stamps.map((s) => (
          <button key={s.id} className={'stamp' + (cooling ? ' cooling' : '')} style={{ background: s.color }} onClick={() => press(s)} disabled={!ready}>
            <StampArt stamp={s} />
            <span className="stamp-label">{s.label}</span>
          </button>
        ))}
      </main>

      <footer className="child-status" aria-live="polite">
        {last?.status === 'sending' && <span>おくっています…</span>}
        {last?.status === 'sent' && <span>{last.stamp.emoji} おくったよ</span>}
        {last?.status === 'seen' && <span className="seen">👀 せんせいが みたよ</span>}
        {last?.status === 'failed' && <span className="warn">おくれなかった。もういちど おしてね</span>}
      </footer>

      {glow && <div className="glow" style={{ '--glow': glow }} />}
    </div>
  )
}
