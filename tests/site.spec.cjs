const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

const languages = [
  { code: 'en', path: '/', nav: 'Products', hero: 'Rubber,', product: 'Rubber compounds', general: 'General group inquiry' },
  { code: 'id', path: '/id/', nav: 'Produk', hero: 'Karet,', product: 'Kompon karet', general: 'Pertanyaan umum' },
  { code: 'zh', path: '/zh/', nav: '产品', hero: '橡胶制造，', product: '橡胶混炼胶', general: '一般咨询' }
];
const sizes = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'tablet', viewport: { width: 768, height: 1024 } },
  { name: 'phone', viewport: { width: 390, height: 844 } },
  { name: 'small-phone', viewport: { width: 320, height: 640 } }
];

for (const lang of languages) {
  for (const size of sizes) {
    test(`${lang.code} · ${size.name}: layout, navigation, products, contact`, async ({ page }) => {
      await page.setViewportSize(size.viewport);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(lang.path, { waitUntil: 'networkidle' });
      expect(response.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang.code === 'zh' ? 'zh-Hans' : lang.code);
      await expect(page.locator('.hero h1')).toContainText(lang.hero);
      await expect(page.locator('.language-switcher select')).toHaveValue(lang.code);

      // Ensure no horizontal scrolling at narrow breakpoints, including long translations.
      const metrics = await page.evaluate(() => ({
        pageWidth: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        bodyWidth: document.body.scrollWidth
      }));
      expect(metrics.pageWidth, 'horizontal overflow at ' + size.name).toBeLessThanOrEqual(metrics.viewport + 2);
      expect(metrics.bodyWidth, 'body overflow at ' + size.name).toBeLessThanOrEqual(metrics.viewport + 2);

      const menu = page.locator('.menu');
      if (size.viewport.width <= 1050) {
        await expect(menu).toBeVisible();
        await menu.click();
        await expect(page.locator('#navigation')).toHaveClass(/open/);
        await expect(page.locator('#navigation a').first()).toContainText(lang.nav);
        await page.locator('#navigation a').first().click();
        await expect(page.locator('#navigation')).not.toHaveClass(/open/);
      } else {
        await expect(page.locator('#navigation a').first()).toContainText(lang.nav);
      }

      // Load and check every company/product photo, including lazy images on translated routes.
      for (const img of await page.locator('img').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(async el => {
          if (!el.complete) await new Promise(resolve => {
            el.addEventListener('load', resolve, { once: true });
            el.addEventListener('error', resolve, { once: true });
            setTimeout(resolve, 5000);
          });
        });
      }
      const brokenImages = await page.locator('img').evaluateAll(imgs =>
        imgs.filter(img => img.naturalWidth === 0).map(img => img.currentSrc || img.src)
      );
      expect(brokenImages, 'missing images on ' + lang.code + ' / ' + size.name).toEqual([]);

      await expect(page.locator('#product-grid .product')).toHaveCount(6);
      await expect(page.locator('#product-grid .product').first()).toContainText(lang.product);
      await page.locator('#product-grid .product').first().click();
      await expect(page.locator('#product-dialog')).toBeVisible();
      await expect(page.locator('#dialog-title')).toContainText(lang.product);
      await page.locator('.dialog-close').click();
      await expect(page.locator('#product-dialog')).not.toBeVisible();

      await page.locator('.company-list button').nth(1).click();
      await expect(page.locator('#company-panel')).toContainText('PT Basuki Aneka Inti Karet');
      await page.locator('.facility-tabs button').nth(2).click();
      await expect(page.locator('#facility-panel')).toContainText(/pasar kemis/i);

      // Every language must expose the new central contact address.
      const centralEmail = page.locator('.contact-details a[href^="mailto:"]');
      await expect(centralEmail).toHaveAttribute('href', 'mailto:info@santorubber.com');
      await expect(centralEmail).toHaveText('info@santorubber.com');
      // Product inquiry categories still route by interest/WhatsApp as before.
      await expect(page.locator('#inquiry-interest option').first()).toHaveText(lang.general);
      // Routing uses stable English values regardless of user-facing language.
      await page.locator('#inquiry-interest').selectOption('Footwear outsoles & foxing');
      await expect(page.locator('#inquiry-interest')).toHaveValue('Footwear outsoles & foxing');
      await page.locator('#inquiry-interest').selectOption('SIP Rubber products');
      await expect(page.locator('#inquiry-interest')).toHaveValue('SIP Rubber products');

      // Verify all three language routes exist and that switching retains the section hash.
      await page.locator('.language-switcher select').selectOption(lang.code);
      await expect(page.locator('.language-switcher select')).toHaveValue(lang.code);

      expect(errors, 'JavaScript errors').toEqual([]);
      fs.mkdirSync('tests/screenshots', { recursive: true });
      await page.screenshot({ path: `tests/screenshots/${lang.code}-${size.name}.png`, fullPage: true, animations: 'disabled' });
    });
  }
}

test('management-approved photos are committed before merging', async ({ request }) => {
  // This test intentionally blocks merging if new photos have not been uploaded yet.
  const required = [
    'factory-production-floor.webp',
    'automotive-rubber-components.webp',
    'assorted-extruded-profiles.webp',
    'footwear-rubber-outsoles.webp',
    'marine-pneumatic-fenders-site.webp'
  ];
  for (const name of required) {
    const response = await request.get('/assets/' + name);
    expect(response.status(), 'Missing management image: ' + name).toBe(200);
    expect(response.headers()['content-type'] || '').toMatch(/image\/webp|application\/octet-stream/);
  }
});

test('language switcher preserves section when switching languages', async ({ page }) => {
  await page.goto('/#products');
  await page.locator('.language-switcher select').selectOption('id');
  await expect(page).toHaveURL(/\/id\/#products$/);
  await expect(page.locator('.language-switcher select')).toHaveValue('id');
  await page.locator('.language-switcher select').selectOption('zh');
  await expect(page).toHaveURL(/\/zh\/#products$/);
  await expect(page.locator('.language-switcher select')).toHaveValue('zh');
});
