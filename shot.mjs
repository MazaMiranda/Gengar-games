import { chromium } from 'playwright';

const [, , url, out, opts = ''] = process.argv;
const full = opts.includes('full');
const width = Number((opts.match(/w=(\d+)/) || [])[1] || 1440);
const height = Number((opts.match(/h=(\d+)/) || [])[1] || 900);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1400);
if (full) await page.evaluate(async () => {
  await new Promise((r) => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 900); y += 900; if (y > document.body.scrollHeight) { clearInterval(t); window.scrollTo(0,0); r(); } }, 60); });
});
await page.waitForTimeout(900);
await page.screenshot({ path: out, fullPage: full });
if (errors.length) console.log('CONSOLE ERRORS:\n' + errors.slice(0, 12).join('\n'));
else console.log('no console errors');
await browser.close();
