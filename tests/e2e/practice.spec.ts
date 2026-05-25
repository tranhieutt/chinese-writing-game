import { test, expect } from '@playwright/test';

test('Random timed practice mode full user flow', async ({ page }) => {
  // 1. Setup LocalStorage to bypass Cookie Banner and prevent it from appearing
  await page.addInitScript(() => {
    window.localStorage.setItem('cookie_consent_accepted', 'true');
  });

  // 2. Go to homepage
  await page.goto('/');

  // 3. Verify navigation button exists in the header stats panel
  await page.waitForSelector('.btn-practice-nav');
  const practiceNavBtn = page.locator('.btn-practice-nav');
  await expect(practiceNavBtn).toBeVisible();
  await expect(practiceNavBtn).toContainText('Luyện ngẫu nhiên');

  // 3. Click navigation button to go to practice page
  await practiceNavBtn.click();

  // 4. Verify we are navigated to /practice and setup card is loaded
  await page.waitForURL('**/practice');
  await page.waitForSelector('.setup-card');
  
  const setupTitle = page.locator('.setup-title');
  await expect(setupTitle).toContainText('Luyện Ngẫu Nhiên HSK');

  // Verify setup options exist
  const hsk1Btn = page.locator('#hsk-level-1');
  const count3Btn = page.locator('#word-count-3');
  const startBtn = page.locator('#start-practice-btn');

  await expect(hsk1Btn).toBeVisible();
  await expect(count3Btn).toBeVisible();
  await expect(startBtn).toBeVisible();

  // 5. Select HSK 1 and 3 Words challenge and click Start
  await hsk1Btn.click();
  await count3Btn.click();
  await startBtn.click();

  // 6. Verify we transitioned to Active Practice mode
  await page.waitForSelector('.practice-header-row');
  await page.waitForSelector('#stopwatch-container');
  await page.waitForSelector('#jade-beads-container');
  await page.waitForSelector('#target-character');

  // Check stopwatch running element
  const stopwatch = page.locator('#stopwatch-time');
  await expect(stopwatch).toBeVisible();
  
  // Verify jade progress beads match count of 3
  const beads = page.locator('.jade-bead');
  await expect(beads).toHaveCount(3);

  // Verify target character is loaded
  const targetChar = page.locator('#target-character');
  await expect(targetChar).not.toBeEmpty();

  // Verify Mascot speech bubble is updated
  const mascotText = page.locator('#mascot-text');
  await expect(mascotText).toBeVisible();
  await expect(mascotText).toContainText('Trận đấu bắt đầu');

  // Verify control buttons exist
  const skipBtn = page.locator('#skip-word-btn');
  const quitBtn = page.locator('#quit-practice-btn');
  await expect(skipBtn).toBeVisible();
  await expect(quitBtn).toBeVisible();

  // 7. Simulate skipping words to advance the challenge
  // Skip word 1
  await skipBtn.click();
  await page.waitForTimeout(200); // short wait for state transition

  // Skip word 2
  await skipBtn.click();
  await page.waitForTimeout(200);

  // Skip word 3 (final word)
  await skipBtn.click();

  // 8. Verify transition to Summary/Result Screen
  await page.waitForSelector('.result-card');
  const resultTitle = page.locator('.result-title');
  await expect(resultTitle).toContainText('Thử Thách Hoàn Thành!');

  // Verify ink stats table values exist
  const summaryHsk = page.locator('#summary-hsk');
  const summaryCompleted = page.locator('#summary-completed');
  const summaryTime = page.locator('#summary-time');
  const summarySpeed = page.locator('#summary-speed');
  const summaryXp = page.locator('#summary-xp');

  await expect(summaryHsk).toContainText('HSK 1');
  await expect(summaryCompleted).toContainText('0 / 3 từ'); // since we skipped all
  await expect(summaryTime).toBeVisible();
  await expect(summarySpeed).toBeVisible();
  await expect(summaryXp).toBeVisible();

  // Verify buttons to loop back or go home exist
  const playAgainBtn = page.locator('#play-again-btn');
  const backHomeBtn = page.locator('#back-home-btn');
  await expect(playAgainBtn).toBeVisible();
  await expect(backHomeBtn).toBeVisible();

  // 9. Click Loop back to practice again
  await playAgainBtn.click();
  await page.waitForSelector('.setup-card');
  await expect(setupTitle).toContainText('Luyện Ngẫu Nhiên HSK');

  console.log('Practice Mode E2E Flow tested successfully.');
});
