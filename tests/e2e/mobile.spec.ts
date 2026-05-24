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
