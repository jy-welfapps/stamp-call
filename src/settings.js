// 端末に保存する設定（モード・部屋コード・端末のアイコン・スタンプのセット）
const KEY = 'stamp-call-settings-v1'

export function loadSettings() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch (e) { return null }
}

export function saveSettings(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch (e) { /* 保存できない環境 */ }
}

export function clearSettings() {
  try { localStorage.removeItem(KEY) } catch (e) { /* noop */ }
}

/** まぎらわしい文字（0/O, 1/I/l）を除いた8文字 */
export function makeRoomCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const arr = new Uint32Array(8)
  crypto.getRandomValues(arr)
  return Array.from(arr, (n) => chars[n % chars.length]).join('')
}

export function normalizeRoom(s) {
  return (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function isValidRoom(s) {
  return /^[A-Z0-9]{6,32}$/.test(s)
}
