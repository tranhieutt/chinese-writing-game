import { test, expect } from '@playwright/test';

test('Multiplayer local pass-and-play tournament mode E2E user flow', async ({ page }) => {
  // 1. Setup LocalStorage to bypass Cookie Banner
  await page.addInitScript(() => {
    window.localStorage.setItem('cookie_consent_accepted', 'true');
  });

  // 2. Go to homepage
  await page.goto('/');

  // 3. Verify tournament navigation button exists in stats panel
  await page.waitForSelector('.btn-tournament-nav');
  const tourNavBtn = page.locator('.btn-tournament-nav');
  await expect(tourNavBtn).toBeVisible();
  await expect(tourNavBtn).toContainText('Đấu Trường');

  // 4. Click navigation button to go to tournament page
  await tourNavBtn.click();

  // 5. Verify we transitioned to /tournament page and setup card is loaded
  await page.waitForURL('**/tournament');
  await page.waitForSelector('.tour-card');

  const tourTitle = page.locator('.tour-title');
  await expect(tourTitle).toContainText('Đấu Trường Tốc Độ HSK');

  // Verify counters and default inputs exist
  const minusBtn = page.locator('.btn-counter').first();
  const plusBtn = page.locator('.btn-counter').last();
  const counterValue = page.locator('.counter-value');
  const startBtn = page.locator('button:has-text("Bắt Đầu Đua Tài!")');

  await expect(minusBtn).toBeVisible();
  await expect(plusBtn).toBeVisible();
  await expect(counterValue).toContainText('3 Người');
  await expect(startBtn).toBeVisible();

  // Verify there are 3 blank player inputs
  const inputs = page.locator('.player-name-input');
  await expect(inputs).toHaveCount(3);
  await expect(inputs.first()).toHaveValue('');

  // 6. Click Start without entering names and verify validation error triggers
  await startBtn.click();
  const alertBox = page.locator('.validation-alert-tour');
  await expect(alertBox).toBeVisible();
  await expect(alertBox).toContainText('Vui lòng nhập đầy đủ tên cho Người chơi 1!');

  // 7. Enter names for players
  await inputs.nth(0).fill('A Bao');
  await inputs.nth(1).fill('Tieu Hoa');
  await inputs.nth(2).fill('Tieu Long');

  // Click start now that names are populated
  await startBtn.click();

  // 8. Verify transition screen for Player 1 (A Bao) is loaded
  await page.waitForSelector('.transition-card');
  const transitionText = page.locator('.transition-text-big');
  await expect(transitionText).toBeVisible();
  await expect(transitionText).toContainText('Đến lượt của A Bao');

  const playTurnBtn = page.locator('button:has-text("Bắt Đầu Viết Ngay")');
  await expect(playTurnBtn).toBeVisible();

  // 9. Start Player 1 turn and verify active tournament gameplay
  await playTurnBtn.click();

  await page.waitForSelector('.practice-header-row');
  await page.waitForSelector('.active-player-header-card');
  await page.waitForSelector('.stopwatch-wood-frame');
  await page.waitForSelector('#target-character');

  // Verify current active player text matches
  const activePlayerLabel = page.locator('.active-player-text span');
  await expect(activePlayerLabel).toContainText('A Bao');

  // Verify jade progress beads are visible
  const beads = page.locator('.jade-bead');
  await expect(beads).toHaveCount(3); // matching 3 word challenge

  console.log('Tournament Mode E2E Flow tested successfully.');
});
