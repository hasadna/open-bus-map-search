import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('An instruction video for Report a bug', async ({ page }) => {
  await page.getByLabel('bug').locator('svg').click()
  await page.getByLabel('לפתוח סרטון על העמוד הזה').locator('svg').click()
  const iframeElement = await page.waitForSelector('iframe')
  expect(iframeElement.isVisible())
  const videoSrc = page.locator('iframe')
  await expect(videoSrc).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=11',
  )
  await page.locator('iframe').contentFrame().getByLabel('Play', { exact: true }).click()
  await page
    .locator('iframe')
    .contentFrame()
    .getByLabel('Pause keyboard shortcut k')
    .waitFor({ state: 'visible', timeout: 5000 })
  await page.locator('iframe').contentFrame().getByLabel('Pause keyboard shortcut k').click()
  await page.getByLabel('Close', { exact: true }).click()
  await page.getByLabel('לפתוח סרטון על העמוד הזה').press('ControlOrMeta+c')
})

test('bug missing field - request type', async ({ page }) => {
  await test.step('Open bug report modal', async () => {
    await page.getByLabel('bug').locator('svg').click()
  })

  await test.step('Fill required fields', async () => {
    await page.getByLabel('כותרת/סיכום').fill('Test')
    await page.getByLabel('שם מלא').fill('Nils Holgerson')
    await page.getByLabel('אי-מייל').fill('Muli@gmail.com')
    await page.getByLabel('תיאור').fill('חסרות הנסיעות של המפקדת אקה')
    await page.getByLabel('סביבה (דפדפן, מערכת)').fill('כרום')
    await page.getByLabel('התנהגות צפויה').fill('אקה נודדת לארצות הקור')
    await page.getByLabel('התנהגות נוכחית').fill('לא קיימת')
    await page.getByLabel('באיזו תדירות זה קורה?').fill('כל קיץ')
  })

  await test.step('Submit the form', async () => {
    await page.getByRole('button', { name: 'שלח את הדוח' }).click()
  })

  await test.step('Verify missing field error', async () => {
    const errorMessage = page.locator('.ant-form-item-explain-error')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toHaveText('אנא הזן סוג בקשה!')
  })
})
