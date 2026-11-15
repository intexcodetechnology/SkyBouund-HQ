const { chromium } = require('@playwright/test');
const fs = require('node:fs');

(async () => {
    const browser = await chromium.launch({ channel: 'msedge' });
    try {
        const page = await browser.newPage();
        const svg = fs.readFileSync('public/favicon.svg', 'utf8');
        for (const [size, file] of [[180, 'public/apple-touch-icon.png'], [32, 'public/brand/favicon-32.png']]) {
            await page.setViewportSize({ width: size, height: size });
            await page.setContent('<style>*{margin:0}svg{display:block;width:100vw;height:100vh}</style>' + svg);
            await page.screenshot({ path: file });
        }
        const png = fs.readFileSync('public/brand/favicon-32.png');
        const header = Buffer.alloc(22);
        header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
        header[6] = 32; header[7] = 32;
        header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
        header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
        fs.writeFileSync('public/favicon.ico', Buffer.concat([header, png]));
        for (const [width, height] of [[1440, 1000], [390, 844]]) {
            await page.setViewportSize({ width, height });
            await page.goto('http://127.0.0.1:8000/login');
            await page.waitForLoadState('networkidle');
            const logo = page.locator('img[alt="SkyBound HQ"]:visible').first();
            if (!await logo.evaluate(i => i.complete && i.naturalWidth > 0)) throw new Error('Logo failed to load');
            if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow');
            await page.screenshot({ path: `design/previews/login-brand-${width}.png`, fullPage: true });
            console.log(`Login branding verified at ${width}px`);
        }
    } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
