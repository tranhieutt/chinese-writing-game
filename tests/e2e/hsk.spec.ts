import { test, expect } from '@playwright/test';
import * as path from 'path';

test('HSK Level selection and dynamic group loading', async ({ page }) => {
  // Go to homepage
  await page.goto('/');

  // Wait for components to load
  await page.waitForSelector('.container');
  await page.waitForSelector('.hsk-select-btn');
  await page.waitForSelector('#group-tabs');
  await page.waitForSelector('#char-selector');

  const hskSelect = page.locator('.hsk-select-btn');
  const groupTabs = page.locator('#group-tabs');
  const charSelector = page.locator('#char-selector');

  // 1. Verify default is HSK 1
  await expect(hskSelect).toHaveValue('hsk1');
  // HSK 1 has "Số đếm & Lượng từ" tab
  await expect(groupTabs).toContainText('Số đếm');
  await expect(charSelector).toContainText('零');

  // 2. Select HSK 2
  await hskSelect.selectOption('hsk2');
  
  // Verify groups and characters update immediately
  // HSK 2 has "Đại từ & Chỉ định" and HSK 2 characters like "您"
  await expect(groupTabs).toContainText('Đại từ');
  await expect(charSelector).toContainText('您');

  // 3. Select HSK 3
  await hskSelect.selectOption('hsk3');

  // Verify groups and characters update immediately
  // HSK 3 has "Cảm xúc & Tâm trạng" and characters like "极"
  await expect(groupTabs).toContainText('Cảm xúc');
  await expect(charSelector).toContainText('极');

  // 4. Test state persistence across reload
  await page.reload();

  // Verify HSK 3 is remembered and loaded
  await page.waitForSelector('.hsk-select-btn');
  await expect(hskSelect).toHaveValue('hsk3');
  await expect(groupTabs).toContainText('Cảm xúc');
  await expect(charSelector).toContainText('极');

  console.log('HSK E2E test completed successfully.');
});
