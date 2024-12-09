import { test } from '@playwright/test'

test('An instruction video for Report a bug', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('bug').locator('svg').click()
  await page.getByLabel('לפתוח סרטון על העמוד הזה').locator('svg').click()
  await page.locator('iframe').contentFrame().getByLabel('Play', { exact: true }).click()
  await page.locator('iframe').contentFrame().getByLabel('Pause keyboard shortcut k').click()
  await page.getByLabel('Close', { exact: true }).click()
  await page.getByLabel('לפתוח סרטון על העמוד הזה').press('ControlOrMeta+c')
})
