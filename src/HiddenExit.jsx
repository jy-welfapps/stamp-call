import { useEffect, useRef, useState } from 'react'

// 設定のパネル：部屋コードの確認と、最初の画面にもどる
// - 職員モード：見えるボタン（visible）ですぐ開く
// - 児童モード：右上のうすい ⚙ を2秒長押し、またはすばやく5回タップで開く（子どもが間違えて開かないように）
export default function HiddenExit({ onExit, room, visible = false }) {
  const timer = useRef(null)
  const [open, setOpen] = useState(false)
  const [holding, setHolding] = useState(false)
  const [answer, setAnswer] = useState('')

  const lastTouch = useRef(0)
  const taps = useRef([])
  // すばやく5回タップでも開く（長押しが効きにくい端末のため）
  const countTap = () => {
    const now = Date.now()
    taps.current = taps.current.filter((t) => now - t < 3000).concat(now)
    if (taps.current.length < 5) return false
    taps.current = []
    return true
  }
  const startHold = (e) => {
    if (e.type === 'touchstart') lastTouch.current = Date.now()
    else if (Date.now() - lastTouch.current < 1500) return // タッチの後に来るマウスの動きは無視
    clearTimeout(timer.current)
    if (countTap()) { setHolding(false); setOpen(true); return }
    setHolding(true)
    timer.current = setTimeout(() => { setHolding(false); setOpen(true) }, 2000)
  }
  const endHold = (e) => {
    if (e && e.type.startsWith('mouse') && Date.now() - lastTouch.current < 1500) return
    clearTimeout(timer.current); setHolding(false)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  const close = () => { setOpen(false); setAnswer('') }

  return (
    <>
      {visible ? (
        <button className="settings-btn" onClick={() => setOpen(true)}>⚙ 設定</button>
      ) : (
        <div
          className={'hidden-exit' + (holding ? ' holding' : '')}
          onTouchStart={startHold} onTouchEnd={endHold}
          onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="設定（長押し）"
        >⚙</div>
      )}
      {open && (
        <div className="modal-back">
          <div className="modal">
            <h3>設定 <small className="muted">v{__APP_VERSION__}</small></h3>
            <p className="muted small">部屋コード</p>
            <p className="room-show">{room}</p>
            <hr />
            <p>最初の設定の画面にもどりますか？<br /><small className="muted">（もどると、この端末のモード・部屋コードをもう一度入れます）<br />確認のため「7 + 5」の答えを入れてください</small></p>
            <input inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="こたえ" />
            <div className="row">
              <button className="btn" onClick={close}>とじる</button>
              <button className="btn primary" disabled={answer.trim() !== '12'} onClick={onExit}>最初の画面にもどる</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
