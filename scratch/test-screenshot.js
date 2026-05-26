const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to tournament page...');
  
  // Set localStorage via page.addInitScript to bypass Cookie Banner
  await page.addInitScript(() => {
    window.localStorage.setItem('cookie_consent_accepted', 'true');
  });
  
  await page.goto('http://localhost:3000/tournament');
  
  // Wait for the card to render
  await page.waitForSelector('.tour-card');
  
  // Create scratch folder if not exists
  const scratchDir = path.join(__dirname);
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }
  
  // Take screenshot 1: Setup view initial state
  await page.screenshot({ path: path.join(scratchDir, 'setup-initial.png') });
  console.log('Took setup-initial.png');
  
  // Click Start without entering names
  console.log('Clicking start without names...');
  await page.click('button:has-text("Bắt Đầu Đua Tài!")');
  await page.waitForTimeout(500);
  
  // Take screenshot 2: After clicking start without names (should show validation error)
  await page.screenshot({ path: path.join(scratchDir, 'setup-error.png') });
  console.log('Took setup-error.png');
  
  // Fill names
  console.log('Filling player names...');
  const inputs = page.locator('.player-name-input');
  await inputs.nth(0).fill('A Bao');
  await inputs.nth(1).fill('Tieu Hoa');
  await inputs.nth(2).fill('Tieu Long');

  // Test selecting HSK level and word count
  console.log('Selecting HSK2 and 5 Words...');
  const hsk1Btn = page.locator('button:has-text("Cấp HSK1")');
  const hsk2Btn = page.locator('button:has-text("Cấp HSK2")');
  const hsk3Btn = page.locator('button:has-text("Cấp HSK3")');
  const words3Btn = page.locator('button:has-text("3 Từ Hán")');
  const words5Btn = page.locator('button:has-text("5 Từ Hán")');
  
  console.log('Classes BEFORE clicking HSK2 & 5 Words:');
  console.log('  HSK1:', await hsk1Btn.getAttribute('class'));
  console.log('  HSK2:', await hsk2Btn.getAttribute('class'));
  console.log('  Words 3:', await words3Btn.getAttribute('class'));
  console.log('  Words 5:', await words5Btn.getAttribute('class'));

  // Click them
  await hsk2Btn.click();
  await words5Btn.click();
  await page.waitForTimeout(200);

  console.log('Classes AFTER clicking HSK2 & 5 Words:');
  console.log('  HSK1:', await hsk1Btn.getAttribute('class'));
  console.log('  HSK2:', await hsk2Btn.getAttribute('class'));
  console.log('  Words 3:', await words3Btn.getAttribute('class'));
  console.log('  Words 5:', await words5Btn.getAttribute('class'));

  // Take screenshot after selection change
  await page.screenshot({ path: path.join(scratchDir, 'setup-selection-changed.png') });
  console.log('Took setup-selection-changed.png');

  // Click Start again
  console.log('Clicking start with names...');
  await page.click('button:has-text("Bắt Đầu Đua Tài!")');
  await page.waitForTimeout(1000);
  
  // Take screenshot 3: Transition state
  await page.screenshot({ path: path.join(scratchDir, 'transition-screen.png') });
  console.log('Took transition-screen.png');
  
  await browser.close();
  console.log('Done!');
})();
