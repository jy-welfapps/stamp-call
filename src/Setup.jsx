import { useState } from 'react'
import config from './config/stamps.json'
import { makeRoomCode, normalizeRoom, isValidRoom } from './settings.js'
import { unlockAudio } from './sound.js'
import { joinRoom } from './firebase.js'

export default function Setup({ onStart }) {
  const [mode, setMode] = useState(null)
  const [room, setRoom] = useState('')
  const [deviceId, setDeviceId] = useState(config.devices[0].id)
  const [setId, setSetId] = useState(config.sets[0].id)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const code = normalizeRoom(room)
  const ok = mode && isValidRoom(code)

  const go = async () => {
    unlockAudio()
    setBusy(true); setError('')
    try {
      await joinRoom(code)
      onStart({ mode, room: code, deviceId, setId })
    } catch (e) {
      console.error(e)
      setError('つながりませんでした。ネットと部屋コードを確認してください。（' + (e.code || e.message) + '）')
      setBusy(false)
    }
  }

  return (
    <div className="setup">
      <h1>はじめの設定</h1>
      <p className="muted">この端末で1回だけ。次からは自動で同じ画面が開きます。</p>

      <h2>1. この端末はどっち？</h2>
      <div className="row">
        <button className={'choice' + (mode === 'child' ? ' on' : '')} onClick={() => setMode('child')}>🧒 児童モード<br /><small>スタンプを送る</small></button>
        <button className={'choice' + (mode === 'staff' ? ' on' : '')} onClick={() => setMode('staff')}>🧑‍🏫 職員モード<br /><small>スタンプを受け取る</small></button>
      </div>

      <h2>2. 部屋コード</h2>
      <p className="muted">同じ部屋コードの端末どうしでつながります。職員の端末で作って、児童の端末に同じコードを入れてください。</p>
      <div className="row">
        <input className="room" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="例：K7PM3QXA" autoCapitalize="characters" autoCorrect="off" spellCheck="false" />
        <button className="btn" onClick={() => setRoom(makeRoomCode())}>新しく作る</button>
      </div>
      {room && !isValidRoom(code) && <p className="warn">英数字6文字以上にしてください</p>}

      {mode === 'child' && (
        <>
          <h2>3. この端末のしるし</h2>
          <p className="muted">職員の画面には、このしるしで出ます（名前は入れません）。</p>
          <div className="devices">
            {config.devices.map((d) => (
              <button key={d.id} className={'device' + (deviceId === d.id ? ' on' : '')} style={{ '--c': d.color }} onClick={() => setDeviceId(d.id)}>
                <span className="device-icon">{d.icon}</span><span>{d.colorName}</span>
              </button>
            ))}
          </div>
          <h2>4. スタンプの数</h2>
          <div className="row wrap">
            {config.sets.map((s) => (
              <button key={s.id} className={'choice small' + (setId === s.id ? ' on' : '')} onClick={() => setSetId(s.id)}>{s.name}</button>
            ))}
          </div>
        </>
      )}

      {error && <p className="warn">{error}</p>}
      <button className="btn primary big" disabled={!ok || busy} onClick={go}>{busy ? 'つないでいます…' : 'はじめる'}</button>
    </div>
  )
}
