const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const mode = process.argv[2] || 'stills';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(__dirname, 'reel.html') + (process.env.F ? '?f='+process.env.F : ''));
  await page.evaluate(async () => { await document.fonts.load('900 40px Heebo'); await document.fonts.load('700 40px Rubik'); await document.fonts.load('800 40px Rubik'); await document.fonts.load('800 40px Heebo'); await document.fonts.ready; });
  const total = await page.evaluate(() => window.TOTAL);
  if (mode === 'stills') {
    const times = process.argv.slice(3).map(Number);
    fs.mkdirSync('stills', { recursive: true });
    for (const t of times) {
      await page.evaluate(t => window.render(t), t);
      await page.waitForTimeout(30);
      await page.screenshot({ path: `stills/t_${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 85 });
    }
  } else {
    fs.mkdirSync('frames', { recursive: true });
    const n = Math.round(total * 30);
    for (let f = 0; f < n; f++) {
      await page.evaluate(t => window.render(t), f / 30);
      await page.screenshot({ path: `frames/${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
    }
    console.log('frames', n, 'total', total);
  }
  await browser.close();
})();
