const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log("Page loaded");
    
    // Check illustration dimensions
    const dims = await page.evaluate(() => {
        const ill = document.querySelector('.sc-illustration-layer');
        if (!ill) return null;
        const rect = ill.getBoundingClientRect();
        return { w: rect.width, h: rect.height, l: rect.left, t: rect.top };
    });
    console.log("Illustration dims:", dims);
    
    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
