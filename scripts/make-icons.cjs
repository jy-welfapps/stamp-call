// public/icon.svg から PNG アイコンを作る（node scripts/make-icons.cjs）
const { chromium } = require('playwright')
const fs = require('fs'); const path = require('path')
;(async () => {
  const svg = fs.readFileSync(path.join(__dirname, '../public/icon.svg'), 'utf8')
  const b = await chromium.launch()
  for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
    const p = await b.newPage({ viewport: { width: size, height: size } })
    await p.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`)
    await p.screenshot({ path: path.join(__dirname, '../public', name), omitBackground: true })
  }
  await b.close()
})()
