import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged, connectAuthEmulator } from 'firebase/auth'
import {
  getDatabase, ref, set, push, update, remove, onValue, query,
  orderByChild, startAt, endAt, get, serverTimestamp, onChildAdded, connectDatabaseEmulator
} from 'firebase/database'
import { firebaseConfig, isFirebaseConfigured, useEmulator } from './firebaseConfig.js'
import config from './config/stamps.json'

let app, auth, db
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getDatabase(app)
  if (useEmulator) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectDatabaseEmulator(db, '127.0.0.1', 9000)
  }
}

const KEEP_MS = (config.keepHours || 24) * 60 * 60 * 1000

/** 匿名ログイン（すでにログイン済みならそのユーザー） */
export function ensureSignedIn() {
  return new Promise((resolve, reject) => {
    const stop = onAuthStateChanged(auth, (user) => {
      if (user) { stop(); resolve(user) }
    }, reject)
    if (!auth.currentUser) signInAnonymously(auth).catch((e) => { stop(); reject(e) })
  })
}

/** 部屋に参加（ルールでこの登録を確認してから読み書きを許す） */
export async function joinRoom(room) {
  const user = await ensureSignedIn()
  await set(ref(db, `rooms/${room}/members/${user.uid}`), Date.now())
  return user
}

/** スタンプを送る。送った記録のキーを返す */
export async function sendStamp(room, stampId, device) {
  const s = config.stamps[stampId]
  const data = {
    stampId,
    label: s.label,
    at: serverTimestamp(),
    by: auth.currentUser.uid,
    device: {
      id: device.id, icon: device.icon, name: device.name,
      color: device.color, colorName: device.colorName
    }
  }
  if (s.emoji) data.emoji = s.emoji
  if (s.image) data.image = s.image
  const r = await push(ref(db, `rooms/${room}/stamps`), data)
  return r.key
}

/** 1つのスタンプを見張る（児童側：「せんせいが みたよ」） */
export function watchStamp(room, key, cb) {
  return onValue(ref(db, `rooms/${room}/stamps/${key}`), (snap) => cb(snap.val()))
}

/** 職員側：直近 keepHours 時間のスタンプ一覧 */
export function watchRecent(room, cb) {
  const since = Date.now() - KEEP_MS
  const q = query(ref(db, `rooms/${room}/stamps`), orderByChild('at'), startAt(since))
  return onValue(q, (snap) => {
    const list = []
    snap.forEach((c) => { list.push({ key: c.key, ...c.val() }) })
    list.sort((a, b) => (b.at || 0) - (a.at || 0))
    cb(list)
  })
}

/** 職員側：新しく届いたスタンプだけを知らせる（開いた時点より前のは鳴らさない） */
export function watchNew(room, cb) {
  const q = query(ref(db, `rooms/${room}/stamps`), orderByChild('at'), startAt(Date.now() - 5000))
  return onChildAdded(q, (c) => cb({ key: c.key, ...c.val() }))
}

export function markSeen(room, key) {
  return update(ref(db, `rooms/${room}/stamps/${key}`), { seenAt: serverTimestamp() })
}

/** keepHours より古いスタンプを消す（職員端末が開いた時と1時間ごと） */
export async function cleanupOld(room) {
  const cutoff = Date.now() - KEEP_MS
  const q = query(ref(db, `rooms/${room}/stamps`), orderByChild('at'), endAt(cutoff))
  const snap = await get(q)
  const tasks = []
  snap.forEach((c) => { tasks.push(remove(c.ref)) })
  await Promise.all(tasks)
  return tasks.length
}

/** つながっているか */
export function watchConnected(cb) {
  return onValue(ref(db, '.info/connected'), (snap) => cb(snap.val() === true))
}

export { isFirebaseConfigured }
