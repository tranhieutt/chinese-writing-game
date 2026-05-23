import { test, expect } from '@playwright/test';
import * as path from 'path';

test('Mobile scroll check', async ({ page }) => {
  const viewport = page.viewportSize();
  console.log(`Testing with mobile viewport: ${viewport?.width}x${viewport?.height}`);

  // Go to homepage
  await page.goto('/');
  
  // Wait for the components to load
  await page.waitForSelector('#group-tabs');
  await page.waitForSelector('#char-selector');

  const elementSizes = await page.evaluate(() => {
    const results: any[] = [];
    const getDetails = (selector: string) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      return {
        selector,
        className: el.className,
        tagName: el.tagName,
        clientWidth: el.clientWidth,
        scrollWidth: el.scrollWidth,
        offsetWidth: el.offsetWidth,
      };
    };

    results.push(getDetails('html'));
    results.push(getDetails('body'));
    results.push(getDetails('.container'));
    
    const container = document.querySelector('.container');
    if (container) {
      Array.from(container.children).forEach((child, i) => {
        results.push({
          selector: `.container > child(${i}) [${child.tagName}]`,
          className: child.className,
          tagName: child.tagName,
          clientWidth: child.clientWidth,
          scrollWidth: child.scrollWidth,
          offsetWidth: (child as HTMLElement).offsetWidth,
        });
      });
    }
    
    return results;
  });

  console.log('Element sizes:', JSON.stringify(elementSizes, null, 2));

  const groupTabs = page.locator('#group-tabs');
  const charSelector = page.locator('#char-selector');

  // Verify elements are visible
  await expect(groupTabs).toBeVisible();
  await expect(charSelector).toBeVisible();

  // Evaluate scroll properties
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

  console.log('Group Tabs properties:', groupTabsProps);
  console.log('Character Selector properties:', charSelectorProps);

  // Assert that they are scrollable (scrollWidth > clientWidth)
  expect(groupTabsProps.scrollWidth).toBeGreaterThan(groupTabsProps.clientWidth);
  expect(charSelectorProps.scrollWidth).toBeGreaterThan(charSelectorProps.clientWidth);

  // Assert that they start aligned left (scrollLeft === 0)
  expect(groupTabsProps.scrollLeft).toBe(0);
  expect(charSelectorProps.scrollLeft).toBe(0);

  // Capture screenshot of the initial state
  const artifactDir = 'C:/Users/x1 carbon/.gemini/antigravity/brain/d2111474-eb8c-4544-bab8-8759eb721307';
  await page.screenshot({ path: path.join(artifactDir, 'mobile_initial.png') });
  console.log('Saved initial mobile screenshot.');

  // Scroll both containers to the right
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

  // Capture screenshot of the scrolled state
  await page.screenshot({ path: path.join(artifactDir, 'mobile_scrolled.png') });
  console.log('Saved scrolled mobile screenshot.');
});
