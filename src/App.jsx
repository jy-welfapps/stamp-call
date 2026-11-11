import { useState } from 'react'
import Setup from './Setup.jsx'
import Child from './Child.jsx'
import Staff from './Staff.jsx'
import { loadSettings, saveSettings, clearSettings } from './settings.js'
import { isFirebaseConfigured } from './firebase.js'

export default function App() {
  const [settings, setSettings] = useState(loadSettings)

  if (!isFirebaseConfigured) {
    return (
      <div className="setup">
        <h1>準備中</h1>
        <p>Firebase の設定値がまだ入っていません。<br />README の「Firebase の設定値を入れる」を見てください。</p>
      </div>
    )
  }

  const start = (s) => { saveSettings(s); setSettings(s) }
  const reset = () => { clearSettings(); setSettings(null) }

  if (!settings) return <Setup onStart={start} />
  if (settings.mode === 'child') return <Child settings={settings} onExit={reset} />
  return <Staff settings={settings} onExit={reset} />
}
