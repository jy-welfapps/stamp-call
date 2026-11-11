// 音ファイルを使わず Web Audio で鳴らす（オフラインでも鳴る・ファイル不要）
// iPad の Safari は、画面を一度タップしないと音が出ない → unlockAudio() をボタンの中で呼ぶ
let ctx = null

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    // 無音を一瞬鳴らして解錠
    const o = ctx.createOscillator(); const g = ctx.createGain()
    g.gain.value = 0; o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.01)
  } catch (e) { /* 音が使えない端末 */ }
}

export function audioReady() {
  return !!ctx && ctx.state === 'running'
}

function tone(freq, start, dur, vol = 0.25, type = 'sine') {
  const o = ctx.createOscillator(); const g = ctx.createGain()
  o.type = type; o.frequency.value = freq
  g.gain.setValueAtTime(0.0001, ctx.currentTime + start)
  g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur)
  o.connect(g).connect(ctx.destination)
  o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + dur + 0.05)
}

/** 児童側：送った時のやさしい音（ド・ミ・ソ） */
export function playSent() {
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()
  tone(523, 0, 0.35, 0.2); tone(659, 0.12, 0.35, 0.2); tone(784, 0.24, 0.5, 0.2)
}

/** 児童側：「せんせいが みたよ」の音 */
export function playSeen() {
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()
  tone(784, 0, 0.25, 0.18); tone(1047, 0.15, 0.45, 0.18)
}

/** 職員側：届いた時の目立つ音（ピンポン×2） */
export function playIncoming() {
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()
  tone(880, 0, 0.4, 0.35, 'triangle'); tone(660, 0.35, 0.6, 0.35, 'triangle')
  tone(880, 1.0, 0.4, 0.35, 'triangle'); tone(660, 1.35, 0.6, 0.35, 'triangle')
}

export function vibrate(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern) } catch (e) { /* 非対応 */ }
}
