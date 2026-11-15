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
      // Consistent rounded action buttons across every language and screen size.
      const corners = await page.evaluate(() => {
        const radius = selector => getComputedStyle(document.querySelector(selector)).borderTopLeftRadius;
        return {
          heroCTA:radius('.hero .button'),
          filter:radius('.filters button'),
          language:radius('.language-switcher select'),
          formSubmit:radius('#inquiry-form button[value="email"]'),
          formWhatsApp:radius('#inquiry-form button[value="whatsapp"]'),
          productCard:radius('#product-grid .product'),
          companyTab:radius('.company-list button'),
          facilityTab:radius('.facility-tabs button'),
          textField:radius('#inquiry-form input[name="name"]')
        };
      });
      for (const key of ['heroCTA','filter','formSubmit','formWhatsApp']) {
        expect(corners[key], key+' must be a fully rounded pill').toBe('999px');
      }
      expect(corners.productCard).toBe('16px');
      expect(corners.companyTab).toBe('12px');
      expect(corners.facilityTab).toBe('12px');
      expect(corners.textField).toBe('12px');
      // Language picker should read as a compact utility dropdown, not a prominent CTA.
      expect(corners.language).toBe('10px');
      const typography = await page.evaluate(() => {
        const dropdown = document.querySelector('.language-switcher select');
        const rect = dropdown.getBoundingClientRect();
        const styles = getComputedStyle(dropdown);
        return {
          width:rect.width,
          height:rect.height,
          appearance:styles.appearance,
          font:styles.fontFamily,
          backgroundImage:styles.backgroundImage,
          bodyFont:getComputedStyle(document.body).fontFamily,
          headingFont:getComputedStyle(document.querySelector('.hero h1')).fontFamily
        };
      });
      expect(typography.width).toBe(size.viewport.width <= 360 ? 68 : size.viewport.width <= 600 ? 72 : 76);
      expect(typography.height).toBe(size.viewport.width <= 600 ? 36 : 38);
      expect(typography.appearance).toBe('none');
      expect(typography.backgroundImage).toContain('data:image/svg+xml');
      expect(typography.font).toContain('Inter');
      expect(typography.bodyFont).toContain('Inter');
      expect(typography.headingFont).toContain('Manrope');
      if (size.viewport.width <= 600) {
        const headerAlignment = await page.evaluate(() => {
          const nav = document.querySelector('header .nav').getBoundingClientRect();
          const picker = document.querySelector('.language-switcher').getBoundingClientRect();
          const menu = document.querySelector('.menu').getBoundingClientRect();
          return {
            rightGap: nav.right-menu.right,
            controlsGap: menu.left-picker.right
          };
        });
        expect(headerAlignment.rightGap, 'Mobile controls should align to the right edge').toBeLessThanOrEqual(3);
        expect(headerAlignment.controlsGap, 'Mobile controls must not overlap').toBeGreaterThanOrEqual(0);
      }
      // Capture the actual header before scrolling; full-page screenshots taken later
      // can omit sticky navigation at the top when Playwright has scrolled the page.
      fs.mkdirSync('tests/screenshots', { recursive: true });
      await page.screenshot({
        path: `tests/screenshots/${lang.code}-${size.name}-header.png`,
        animations:'disabled'
      });




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
      // Original profile photos are low-resolution; rendering must not enlarge them.
      const recycledImg = page.locator('#product-grid [data-open-product="recycled"] .native-photo-recycling');
      const recycledDimensions = await recycledImg.evaluate(el => ({
        rendered: el.getBoundingClientRect().width, natural: el.naturalWidth
      }));
      expect(recycledDimensions.natural).toBeGreaterThan(0);
      expect(recycledDimensions.rendered).toBeLessThanOrEqual(recycledDimensions.natural + 2);
      const tileDimensions = await page.locator('.native-photo-tiles').evaluate(el => ({
        rendered: el.getBoundingClientRect().width, natural: el.naturalWidth
      }));
      expect(tileDimensions.rendered).toBeLessThanOrEqual(tileDimensions.natural + 2);
      await page.locator('#product-grid .product').first().click();
      await expect(page.locator('#product-dialog')).toBeVisible();
      const dialogCorners = await page.evaluate(() => ({
        close:getComputedStyle(document.querySelector('.dialog-close')).borderRadius,
        dialog:getComputedStyle(document.querySelector('#product-dialog')).borderTopLeftRadius
      }));
      expect(dialogCorners.close).toBe('50%');
      expect(dialogCorners.dialog).toBe('16px');

      await expect(page.locator('#dialog-title')).toContainText(lang.product);
      await page.locator('.dialog-close').click();
      await expect(page.locator('#product-dialog')).not.toBeVisible();

      for (const key of ['srf', 'baik', 'sol', 'sip']) {
        const tabLogo = page.locator('#company-' + key + ' .company-tab-logo');
        await expect(tabLogo).toHaveAttribute('role', 'img');
        const frame = await tabLogo.evaluate(el => ({
          width: el.getBoundingClientRect().width,
          height: el.getBoundingClientRect().height,
          background: getComputedStyle(el).backgroundImage
        }));
        expect(frame.background).toContain('/assets/logos/' + key + '.webp');
        expect(frame.width, key + ' logo should never expand into the company text').toBeGreaterThanOrEqual(44);
        expect(frame.width, key + ' logo should remain a thumbnail').toBeLessThanOrEqual(90);
        expect(frame.height, key + ' logo should remain contained').toBeLessThanOrEqual(60);
      }
      await page.locator('.company-list button').nth(1).click();
      await expect(page.locator('#company-panel')).toContainText('PT Basuki Aneka Inti Karet');
      const companyLogo = page.locator('#company-panel .company-panel-logo');
      const panelFrame = await companyLogo.evaluate(el => ({
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
        background: getComputedStyle(el).backgroundImage
      }));
      expect(panelFrame.background).toContain('/assets/logos/baik.webp');
      expect(panelFrame.width).toBeLessThanOrEqual(180);
      expect(panelFrame.height).toBeLessThanOrEqual(92);
      await page.locator('.facility-tabs button').nth(2).click();
      await expect(page.locator('#facility-panel')).toContainText(/pasar kemis/i);
      await expect.poll(() => page.locator('#facility-panel img.facility-photo-original').evaluate(el => el.naturalWidth)).toBeGreaterThan(0);
      const facilityImage = await page.locator('#facility-panel img.facility-photo-original').evaluate(el => ({
        rendered: el.getBoundingClientRect().width, natural: el.naturalWidth
      }));
      expect(facilityImage.natural).toBeGreaterThan(0);
      expect(facilityImage.rendered).toBeLessThanOrEqual(facilityImage.natural + 2);

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

test('official group-company logo files are served', async ({ request }) => {
  for (const logo of ['srf', 'baik', 'sol', 'sip']) {
    const response = await request.get('/assets/logos/' + logo + '.webp');
    expect(response.status(), 'Missing logo for ' + logo).toBe(200);
    expect(response.headers()['content-type'] || '').toMatch(/image\/webp|application\/octet-stream/);
  }
});

test('website inquiry uses the central mailbox and a direct submission endpoint', async () => {
  const application = fs.readFileSync(require('node:path').join(__dirname, '..', 'app.js'), 'utf8');
  expect(application).toContain("const to='info@santorubber.com';");
  expect(application).toContain("https://formsubmit.co/ajax/info@santorubber.com");
  expect(application).toContain("response.json()");
  expect(application).toContain("msg.whatsapp");
  for (const oldEmail of ['sales@industrikaret.com', 'sales@siprubber.com', 'semesta.olahlestari@gmail.com']) {
    expect(application).not.toContain(oldEmail);
  }
});

test('SEO metadata and JSON-LD are correct on all three language routes', async ({ page, request }) => {
  for (const loc of languages) {
    await page.goto(loc.path);
    const canonical = 'https://santorubber.com' + loc.path;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://santorubber.com/assets/components.webp');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index,follow/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', {en:'en_US',id:'id_ID',zh:'zh_CN'}[loc.code]);
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    const graph = JSON.parse(ld)['@graph'];
    expect(graph.find(x => x['@type'] === 'Organization').email).toBe('info@santorubber.com');
    expect(graph.find(x => x['@type'] === 'WebPage').url).toBe(canonical);
    await expect(page.locator('#inquiry-form')).toHaveAttribute('action', 'https://formsubmit.co/info@santorubber.com');
    await expect(page.locator('.inquiry-privacy a')).toHaveAttribute('href', 'https://formsubmit.co/privacy.pdf');
  }
  const image = await request.get('/assets/components.webp');
  expect(image.status()).toBe(200);
});

for (const loc of languages) {
  test(`${loc.code}: direct inquiry submission succeeds without opening the email app`, async ({ page }) => {
    const requests = [];
    await page.route('https://formsubmit.co/ajax/info@santorubber.com', async route => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({status:204, headers:{
          'access-control-allow-origin':'*','access-control-allow-methods':'POST, OPTIONS',
          'access-control-allow-headers':'content-type,accept'
        }});
      }
      requests.push(JSON.parse(route.request().postData()));
      return route.fulfill({status:200,contentType:'application/json',
        headers:{'access-control-allow-origin':'*'},
        body:JSON.stringify({success:'true', message:'Submitted'})});
    });
    await page.goto(loc.path);
    await page.locator('#inquiry-form input[name="name"]').fill('Quality Buyer');
    await page.locator('#inquiry-form input[name="email"]').fill('buyer@example.org');
    await page.locator('#inquiry-form input[name="company"]').fill('Test Engineering');
    await page.locator('#inquiry-interest').selectOption('Custom molded components');
    await page.locator('#inquiry-form textarea[name="message"]').fill('Requesting a custom rubber part quotation');
    await page.locator('#inquiry-form button[value="email"]').click();
    await expect(page.locator('#inquiry-status')).toContainText({en:'submitted for delivery',id:'diajukan untuk dikirimkan',zh:'已提交'}[loc.code]);
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      name:'Quality Buyer',email:'buyer@example.org',
      company:'Test Engineering',interest:'Custom molded components',
      language:loc.code
    });
    await expect(page.locator('#inquiry-form input[name="name"]')).toHaveValue('');
    await expect(page.locator('#email-fallback')).toBeHidden();
  });
}

test('inquiry service errors show the email fallback without losing the draft', async ({ page }) => {
  await page.route('https://formsubmit.co/ajax/info@santorubber.com', async route =>
    route.fulfill({status:503,contentType:'application/json',
      headers:{'access-control-allow-origin':'*'},body:JSON.stringify({success:'false'})})
  );
  await page.goto('/');
  await page.locator('#inquiry-form input[name="name"]').fill('Sample Buyer');
  await page.locator('#inquiry-form input[name="email"]').fill('buyer@example.org');
  await page.locator('#inquiry-form textarea[name="message"]').fill('Need a quote for rubber profiles');
  await page.locator('#inquiry-form button[value="email"]').click();
  await expect(page.locator('#inquiry-status')).toContainText('Unable to send directly');
  await expect(page.locator('#email-fallback')).toBeVisible();
  await expect(page.locator('#email-draft')).toHaveAttribute('href', /mailto:info@santorubber.com/);
  await expect(page.locator('#prepared-inquiry')).toHaveValue(/Need a quote for rubber profiles/);
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
