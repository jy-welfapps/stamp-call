import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages では https://<user>.github.io/<repo>/ で配信されるので base をリポジトリ名に合わせる
const base = process.env.BASE_PATH || '/stamp-call/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'stamps/*.svg'],
      manifest: {
        name: 'スタンプでつたえる',
        short_name: 'スタンプ',
        description: 'タブレットからスタンプで先生に伝えるアプリ',
        lang: 'ja',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'any',
        background_color: '#fff8ec',
        theme_color: '#ffb84d',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        navigateFallback: 'index.html'
      }
    })
  ]
})
