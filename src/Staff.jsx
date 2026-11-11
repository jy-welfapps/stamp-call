import { useEffect, useMemo, useRef, useState } from 'react'
import config from './config/stamps.json'
import { joinRoom, watchRecent, watchNew, markSeen, cleanupOld } from './firebase.js'
import { audioReady, playIncoming, unlockAudio, vibrate } from './sound.js'
import { useConnected, useNow, useWakeLock } from './hooks.js'
import { StampArt } from './stampView.jsx'
import HiddenExit from './HiddenExit.jsx'

const REPEAT = (config.staffRepeatSeconds || 30) * 1000

function timeText(at, now) {
  if (!at) return ''
  const d = new Date(at)
  const hm = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  const min = Math.floor((now - at) / 60000)
  const ago = min < 1 ? 'いま' : min < 60 ? `${min}分前` : `${Math.floor(min / 60)}時間前`
  return `${hm}（${ago}）`
}

export default function Staff({ settings, onExit }) {
  const [list, setList] = useState([])
  const [soundOn, setSoundOn] = useState(audioReady())
  const [flash, setFlash] = useState(false)
  const [error, setError] = useState('')
  const connected = useConnected()
  const wake = useWakeLock(true)
  const now = useNow(15000)
  const soundRef = useRef(soundOn)
  soundRef.current = soundOn

  useEffect(() => {
    let stopA = null, stopB = null, cleanTimer = null
    joinRoom(settings.room).then(() => {
      stopA = watchRecent(settings.room, setList)
      stopB = watchNew(settings.room, () => {
        setFlash(true); setTimeout(() => setFlash(false), 1500)
        if (soundRef.current) playIncoming()
        vibrate([300, 150, 300])
      })
      cleanupOld(settings.room).catch(() => {})
      cleanTimer = setInterval(() => cleanupOld(settings.room).catch(() => {}), 60 * 60 * 1000)
    }).catch((e) => setError('つながりませんでした（' + (e.code || e.message) + '）'))
    return () => { stopA && stopA(); stopB && stopB(); clearInterval(cleanTimer) }
  }, [settings.room])

  const unseen = useMemo(() => list.filter((s) => !s.seenAt), [list])

  // まだ確認していないスタンプがある間は、REPEAT 秒ごとに鳴らし直す
  useEffect(() => {
    if (!unseen.length) return
    const t = setInterval(() => {
      setFlash(true); setTimeout(() => setFlash(false), 1500)
      if (soundRef.current) playIncoming()
      vibrate([300, 150, 300])
    }, REPEAT)
    return () => clearInterval(t)
  }, [unseen.length])

  const enableSound = () => { unlockAudio(); setSoundOn(true); setTimeout(() => playIncoming(), 100) }

  return (
    <div className={'staff' + (flash ? ' flash' : '') + (unseen.length ? ' has-unseen' : '')}>
            <header className="staff-head">
        <div>
          <div className="title">スタンプ（職員）</div>
          <div className="muted small">部屋コード <b className="code">{settings.room}</b></div>
        </div>
        <div className="status">
          <HiddenExit onExit={onExit} room={settings.room} visible />
          <span className={'pill ' + (connected ? 'ok' : 'ng')}>{connected ? '● つながっています' : '× つながっていません'}</span>
          <span className={'pill ' + (wake ? 'ok' : 'warn')}>{wake ? '画面ON' : '画面が消えるかも'}</span>
        </div>
      </header>

      {!soundOn && (
        <button className="sound-banner" onClick={enableSound}>🔔 ここをタップして音をオンにする</button>
      )}
      {!connected && <div className="offline-banner">つながっていません。Wi-Fi を確認してください。もどると自動でつながります。</div>}
      {error && <div className="offline-banner">{error}</div>}

      {unseen.length > 0 && <div className="unseen-count">まだ確認していない：{unseen.length}件</div>}

      <ul className="timeline">
        {list.length === 0 && <li className="empty">まだスタンプは届いていません</li>}
        {list.map((s) => (
          <li key={s.key} className={'item' + (s.seenAt ? ' seen' : '')}>
            <span className="device-badge" style={{ background: s.device?.color }} title={s.device?.colorName}>{s.device?.icon}</span>
            <span className="item-stamp"><StampArt stamp={s} size="2.4rem" /></span>
            <span className="item-body">
              <span className="item-label">{s.label}</span>
              <span className="muted small">{s.device?.name}（{s.device?.colorName}）・{timeText(s.at, now)}</span>
            </span>
            {s.seenAt
              ? <span className="done">確認ずみ</span>
              : <button className="btn primary" onClick={() => markSeen(settings.room, s.key)}>確認した</button>}
          </li>
        ))}
      </ul>
      <p className="muted small foot">届いたスタンプは{config.keepHours || 24}時間で自動で消えます。部屋コードの確認や最初の画面にもどる時は「⚙ 設定」から。</p>
    </div>
  )
}
