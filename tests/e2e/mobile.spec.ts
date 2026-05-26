import { test, expect } from '@playwright/test';
import * as path from 'path';

test('Mobile scroll check', async ({ page }) => {
  const viewport = page.viewportSize();
  console.log(`Testing with mobile viewport: ${viewport?.width}x${viewport?.height}`);

  // Go to homepage
  await page.goto('/');
  
  // Wait for the components to load
  await page.waitForSelector('.container');
  await page.waitForSelector('#group-tabs');
  await page.waitForSelector('#char-selector');

  const container = page.locator('.container');
  const groupTabs = page.locator('#group-tabs');
  const charSelector = page.locator('#char-selector');

  // Verify elements are visible
  await expect(container).toBeVisible();
  await expect(groupTabs).toBeVisible();
  await expect(charSelector).toBeVisible();

  // Evaluate scroll properties
  const containerProps = await container.evaluate((el) => {
    return {
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      scrollTop: el.scrollTop,
    };
  });

  const groupTabsProps = await groupTabs.evaluate((el) => {
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollLeft: el.scrollLeft,
    };
  });

  const charSelectorProps = await charSelector.evaluate((el) => {
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollLeft: el.scrollLeft,
    };
  });

  console.log('Container vertical properties:', containerProps);
  console.log('Group Tabs horizontal properties:', groupTabsProps);
  console.log('Character Selector horizontal properties:', charSelectorProps);

  // Assert that horizontal selectors are scrollable (scrollWidth > clientWidth)
  expect(groupTabsProps.scrollWidth).toBeGreaterThan(groupTabsProps.clientWidth);
  expect(charSelectorProps.scrollWidth).toBeGreaterThan(charSelectorProps.clientWidth);

  // Assert that container is vertically scrollable (scrollHeight > clientHeight)
  expect(containerProps.scrollHeight).toBeGreaterThan(containerProps.clientHeight);

  // Assert that everything starts aligned top/left (scrollTop === 0, scrollLeft === 0)
  expect(containerProps.scrollTop).toBe(0);
  expect(groupTabsProps.scrollLeft).toBe(0);
  expect(charSelectorProps.scrollLeft).toBe(0);

  // Capture screenshot of the initial state
  const artifactDir = 'C:/Users/x1 carbon/.gemini/antigravity/brain/d2111474-eb8c-4544-bab8-8759eb721307';
  await page.screenshot({ path: path.join(artifactDir, 'mobile_initial.png') });
  console.log('Saved initial mobile screenshot.');

  // 1. Test Horizontal Scrolling
  await groupTabs.evaluate((el) => {
    el.scrollLeft = 100;
  });
  await charSelector.evaluate((el) => {
    el.scrollLeft = 80;
  });

  // Small delay to let browser render
  await page.waitForTimeout(500);

  const groupTabsPropsAfter = await groupTabs.evaluate((el) => el.scrollLeft);
  const charSelectorPropsAfter = await charSelector.evaluate((el) => el.scrollLeft);
  console.log('Group Tabs scrollLeft after scroll:', groupTabsPropsAfter);
  console.log('Character Selector scrollLeft after scroll:', charSelectorPropsAfter);

  expect(groupTabsPropsAfter).toBeGreaterThan(0);
  expect(charSelectorPropsAfter).toBeGreaterThan(0);

  // Capture screenshot of the horizontally scrolled state
  await page.screenshot({ path: path.join(artifactDir, 'mobile_scrolled.png') });
  console.log('Saved scrolled mobile screenshot.');

  // Reset horizontal scrolls
  await groupTabs.evaluate((el) => { el.scrollLeft = 0; });
  await charSelector.evaluate((el) => { el.scrollLeft = 0; });

  // 2. Test Vertical Scrolling
  await container.evaluate((el) => {
    el.scrollTop = 120;
  });

  // Small delay to let browser render
  await page.waitForTimeout(500);

  const containerPropsAfter = await container.evaluate((el) => el.scrollTop);
  console.log('Container scrollTop after vertical scroll:', containerPropsAfter);

  expect(containerPropsAfter).toBeGreaterThan(0);

  // Capture screenshot of the vertically scrolled state
  await page.screenshot({ path: path.join(artifactDir, 'mobile_vertical_scrolled.png') });
  console.log('Saved vertical scrolled mobile screenshot.');
});

test('Mobile writing canvas and completion button have enough room', async ({ page }) => {
  await page.goto('/');

  await page.waitForSelector('.canvas-area-container');
  await page.waitForSelector('.canvas-wrapper');

  const canvasWrapper = page.locator('.canvas-wrapper');
  const prevButton = page.locator('.canvas-area-container .btn-floating-nav').first();
  const nextButton = page.locator('.canvas-area-container .btn-floating-nav').last();

  await expect(canvasWrapper).toBeVisible();
  await expect(prevButton).toBeVisible();
  await expect(nextButton).toBeVisible();

  await page.locator('.complete-overlay').evaluate((el) => {
    el.classList.add('show');
  });

  const layout = await page.evaluate(() => {
    const area = document.querySelector('.canvas-area-container') as HTMLElement;
    const wrapper = document.querySelector('.canvas-wrapper') as HTMLElement;
    const overlayButton = document.querySelector('.btn-complete-next') as HTMLElement;
    const sideButtons = Array.from(document.querySelectorAll('.canvas-area-container .btn-floating-nav')) as HTMLElement[];

    const areaRect = area.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const buttonRect = overlayButton.getBoundingClientRect();
    const sideRects = sideButtons.map((button) => button.getBoundingClientRect());

    return {
      areaClientWidth: area.clientWidth,
      areaScrollWidth: area.scrollWidth,
      wrapperWidth: wrapperRect.width,
      wrapperHeight: wrapperRect.height,
      nextButtonBottomGap: wrapperRect.bottom - buttonRect.bottom,
      sideButtonSizes: sideRects.map((rect) => ({
        width: rect.width,
        height: rect.height,
      })),
      leftButtonInside: sideRects[0].left >= areaRect.left,
      rightButtonInside: sideRects[1].right <= areaRect.right,
    };
  });

  expect(layout.wrapperWidth).toBeGreaterThanOrEqual(172);
  expect(layout.wrapperHeight).toBeGreaterThanOrEqual(172);
  expect(layout.nextButtonBottomGap).toBeGreaterThanOrEqual(8);
  for (const size of layout.sideButtonSizes) {
    expect(Math.abs(size.width - size.height)).toBeLessThanOrEqual(1);
  }
  expect(layout.areaScrollWidth).toBeLessThanOrEqual(layout.areaClientWidth + 1);
  expect(layout.leftButtonInside).toBe(true);
  expect(layout.rightButtonInside).toBe(true);

  await page.screenshot({ path: path.join('test-results', 'mobile-complete-overlay.png'), fullPage: true });
});

test('Mobile Cookie Consent Banner check', async ({ page }) => {
  // Go to homepage without setting localStorage to let the cookie banner show up
  await page.goto('/');

  // Wait for the banner with 1s delay to trigger
  await page.waitForSelector('.cookie-banner-container', { state: 'visible', timeout: 5000 });

  const banner = page.locator('.cookie-banner-container');
  const declineBtn = page.locator('.cookie-btn-decline');
  const acceptBtn = page.locator('.cookie-btn-accept');

  // Verify elements are visible on mobile viewport
  await expect(banner).toBeVisible();
  await expect(declineBtn).toBeVisible();
  await expect(acceptBtn).toBeVisible();

  // Evaluate bounding rect to check that it matches mobile requirements (90% width, stays on screen)
  const rect = await banner.boundingBox();
  const viewport = page.viewportSize();
  expect(rect).not.toBeNull();
  if (rect && viewport) {
    expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height);
    expect(rect.width).toBeLessThanOrEqual(viewport.width);
  }

  // Click accept and ensure it sets localStorage and disappears
  await acceptBtn.click();
  await expect(banner).toBeHidden();

  const isAccepted = await page.evaluate(() => localStorage.getItem('cookie_consent_accepted'));
  expect(isAccepted).toBe('true');
});

test('Mobile Practice Mode full flow check', async ({ page }) => {
  const viewport = page.viewportSize();
  
  // 1. Setup LocalStorage to bypass Cookie Banner
  await page.addInitScript(() => {
    window.localStorage.setItem('cookie_consent_accepted', 'true');
  });

  // 2. Go to homepage
  await page.goto('/');

  // 3. Click navigation button to go to practice page (verify clickable on mobile)
  await page.waitForSelector('.btn-practice-nav');
  const practiceNavBtn = page.locator('.btn-practice-nav');
  await expect(practiceNavBtn).toBeVisible();
  await practiceNavBtn.click();

  // 4. Verify practice setup page is loaded
  await page.waitForURL('**/practice');
  await page.waitForSelector('.setup-card');
  
  const setupCard = page.locator('.setup-card');
  const hsk1Btn = page.locator('#hsk-level-1');
  const count3Btn = page.locator('#word-count-3');
  const startBtn = page.locator('#start-practice-btn');

  await expect(setupCard).toBeVisible();
  await expect(hsk1Btn).toBeVisible();
  await expect(count3Btn).toBeVisible();
  await expect(startBtn).toBeVisible();

  // Check setup card horizontal boundary to make sure it doesn't overflow
  const setupCardProps = await setupCard.evaluate((el) => {
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    };
  });
  expect(setupCardProps.scrollWidth).toBeLessThanOrEqual(setupCardProps.clientWidth + 1);

  // Take screenshot of setup card on mobile
  await page.screenshot({ path: path.join('test-results', 'mobile-practice-setup.png') });

  // 5. Select options and start
  await hsk1Btn.click();
  await count3Btn.click();
  await startBtn.click();

  // 6. Active practice gameplay screen
  await page.waitForSelector('.practice-header-row');
  await page.waitForSelector('#stopwatch-container');
  await page.waitForSelector('#target-character');
  await page.waitForSelector('.canvas-wrapper');

  const canvasWrapper = page.locator('.canvas-wrapper');
  const stopwatch = page.locator('#stopwatch-time');
  const skipBtn = page.locator('#skip-word-btn');
  const quitBtn = page.locator('#quit-practice-btn');

  await expect(canvasWrapper).toBeVisible();
  await expect(stopwatch).toBeVisible();
  await expect(skipBtn).toBeVisible();
  await expect(quitBtn).toBeVisible();

  // Ensure canvas is properly sized on mobile (min 172x172)
  const canvasRect = await canvasWrapper.boundingBox();
  expect(canvasRect?.width).toBeGreaterThanOrEqual(172);
  expect(canvasRect?.height).toBeGreaterThanOrEqual(172);

  // Ensure elements are fully within the viewport (no clipping off-screen)
  if (viewport) {
    const skipRect = await skipBtn.boundingBox();
    const quitRect = await quitBtn.boundingBox();
    expect(skipRect).not.toBeNull();
    expect(quitRect).not.toBeNull();
    if (skipRect && quitRect) {
      expect(skipRect.y + skipRect.height).toBeLessThanOrEqual(viewport.height);
      expect(quitRect.y + quitRect.height).toBeLessThanOrEqual(viewport.height);
    }
  }

  // Take screenshot of active gameplay
  await page.screenshot({ path: path.join('test-results', 'mobile-practice-active.png') });

  // 7. Skip all words to transition to summary
  await skipBtn.click();
  await page.waitForTimeout(200);
  await skipBtn.click();
  await page.waitForTimeout(200);
  await skipBtn.click();

  // 8. Result / Summary screen
  await page.waitForSelector('.result-card');
  const resultCard = page.locator('.result-card');
  await expect(resultCard).toBeVisible();

  const summaryHsk = page.locator('#summary-hsk');
  const playAgainBtn = page.locator('#play-again-btn');
  const backHomeBtn = page.locator('#back-home-btn');

  await expect(summaryHsk).toBeVisible();
  await expect(playAgainBtn).toBeVisible();
  await expect(backHomeBtn).toBeVisible();

  // Check no unwanted horizontal scrolling on the results page
  const resultCardProps = await resultCard.evaluate((el) => {
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    };
  });
  expect(resultCardProps.scrollWidth).toBeLessThanOrEqual(resultCardProps.clientWidth + 1);

  // Take screenshot of results page
  await page.screenshot({ path: path.join('test-results', 'mobile-practice-result.png') });

  // 9. Go back home
  await backHomeBtn.click();
  await page.waitForURL('**/');
});

test('Mobile Tournament Mode full flow check', async ({ page }) => {
  const viewport = page.viewportSize();
  
  // 1. Setup LocalStorage to bypass Cookie Banner
  await page.addInitScript(() => {
    window.localStorage.setItem('cookie_consent_accepted', 'true');
  });

  // 2. Go to homepage
  await page.goto('/');

  // 3. Click navigation button to go to tournament page
  await page.waitForSelector('.btn-tournament-nav');
  const tourNavBtn = page.locator('.btn-tournament-nav');
  await expect(tourNavBtn).toBeVisible();
  await tourNavBtn.click();

  // 4. Verify tournament setup card is loaded
  await page.waitForURL('**/tournament');
  await page.waitForSelector('.tour-card');
  
  const tourCard = page.locator('.tour-card');
  await expect(tourCard).toBeVisible();

  const plusBtn = page.locator('.btn-counter').last();
  const startBtn = page.locator('button:has-text("Bắt Đầu Đua Tài!")');
  const inputs = page.locator('.player-name-input');

  await expect(plusBtn).toBeVisible();
  await expect(startBtn).toBeVisible();

  // Take screenshot of tournament setup
  await page.screenshot({ path: path.join('test-results', 'mobile-tournament-setup.png') });

  // Enter names for 3 players
  await inputs.nth(0).fill('A Bao');
  await inputs.nth(1).fill('Tieu Hoa');
  await inputs.nth(2).fill('Tieu Long');

  // Click start
  await startBtn.click();

  // 5. Verify Transition Screen layout on Mobile
  await page.waitForSelector('.transition-card');
  const transitionCard = page.locator('.transition-card');
  const playTurnBtn = page.locator('button:has-text("Bắt Đầu Viết Ngay")');

  await expect(transitionCard).toBeVisible();
  await expect(playTurnBtn).toBeVisible();

  // Take screenshot of transition card
  await page.screenshot({ path: path.join('test-results', 'mobile-tournament-transition.png') });

  // Click Start Turn
  await playTurnBtn.click();

  // 6. Verify Active Gameplay
  await page.waitForSelector('.practice-header-row');
  await page.waitForSelector('.active-player-header-card');
  await page.waitForSelector('.stopwatch-wood-frame');

  const headerCard = page.locator('.active-player-header-card');
  const woodFrame = page.locator('.stopwatch-wood-frame');

  await expect(headerCard).toBeVisible();
  await expect(woodFrame).toBeVisible();

  // Check that elements fit horizontally
  if (viewport) {
    const headerRect = await headerCard.boundingBox();
    const woodRect = await woodFrame.boundingBox();
    expect(headerRect).not.toBeNull();
    expect(woodRect).not.toBeNull();
    if (headerRect && woodRect) {
      expect(headerRect.x + headerRect.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(woodRect.x + woodRect.width).toBeLessThanOrEqual(viewport.width + 1);
    }
  }

  // Take screenshot of tournament active gameplay
  await page.screenshot({ path: path.join('test-results', 'mobile-tournament-active.png') });
});

