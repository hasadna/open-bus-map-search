import { expect, setupTest, test } from './utils'

const VIDEO_SRC =
  'https://www.youtube-nocookie.com/embed?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=11'

test.beforeEach(async ({ page }) => {
  await setupTest(page)
})

test('An instruction video for Report a bug', async ({ page }) => {
  await page.getByLabel('bug').locator('svg').click()
  await page.getByLabel('לפתוח סרטון על העמוד הזה').locator('svg').click()
  const iframeElement = await page.waitForSelector('iframe')
  expect(iframeElement.isVisible())
  const videoSrc = page.locator('iframe')
  await expect(videoSrc).toHaveAttribute('src', VIDEO_SRC)
  await page.locator('iframe').contentFrame().getByLabel('Play', { exact: true }).click()
  await page.getByLabel('Close', { exact: true }).click()
  await page.getByLabel('לפתוח סרטון על העמוד הזה').press('ControlOrMeta+c')
})

test('bug missing field - request type', async ({ page }) => {
  await test.step('Open bug report modal', async () => {
    await page.getByLabel('bug').locator('svg').click()
  })

  await test.step('Fill required fields', async () => {
    await page.getByLabel('כותרת/סיכום').fill('Test!')
    await page.getByLabel('שם מלא').fill('Nils Holgerson')
    await page.getByLabel('אי-מייל').fill('Muli@gmail.com')
    await page.getByLabel('תיאור').fill('חסרות הנסיעות של המפקדת אקה')
    await page.getByLabel('סביבה (דפדפן, מערכת)').fill('כרום')
    await page.getByLabel('התנהגות צפויה').fill('אקה נודדת לארצות הקור')
    await page.getByLabel('התנהגות נוכחית').fill('לא קיימת')
  })

  await test.step('Submit the form', async () => {
    await page.getByRole('button', { name: 'שלח את הדוח' }).click()
    await page.waitForSelector('.ant-form-item-explain-error')
  })

  await test.step('Verify missing field error', async () => {
    const errorMessages = await page.locator('.ant-form-item-explain-error').allTextContents()
    expect(errorMessages.length).toBe(2)
    expect(errorMessages).toContain('בבקשה הזן סוג הבקשה')
    expect(errorMessages).toContain('בבקשה הזן באיזו תדירות זה קורה')
  })
})
