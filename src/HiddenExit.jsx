import { useRef, useState } from 'react'

// 右上のすみを3秒長押し → 確認 → 最初の画面にもどる（子どもが間違えて抜けないように）
export default function HiddenExit({ onExit }) {
  const timer = useRef(null)
  const [ask, setAsk] = useState(false)
  const [answer, setAnswer] = useState('')
  const start = () => { timer.current = setTimeout(() => setAsk(true), 3000) }
  const cancel = () => clearTimeout(timer.current)
  return (
    <>
      <div className="hidden-exit" onPointerDown={start} onPointerUp={cancel} onPointerLeave={cancel} onContextMenu={(e) => e.preventDefault()} aria-hidden="true" />
      {ask && (
        <div className="modal-back">
          <div className="modal">
            <p>設定の画面にもどりますか？<br /><small>（職員用）「7 + 5」の答えを入れてください</small></p>
            <input inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value)} autoFocus />
            <div className="row">
              <button className="btn" onClick={() => { setAsk(false); setAnswer('') }}>やめる</button>
              <button className="btn primary" disabled={answer.trim() !== '12'} onClick={onExit}>もどる</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
