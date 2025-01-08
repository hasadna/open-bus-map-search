import { test, expect } from '@playwright/test'

test('the YouTube modal in "report a bug" is visible and have the correct src', async ({page,}) => {
  await page.goto('/')
  await page.getByLabel('bug').locator('svg').click()
  await page.getByLabel('לפתוח סרטון על העמוד הזה').locator('svg').click()
  const iframeElement = await page.waitForSelector('iframe')
  const Visible = await iframeElement.isVisible()
  expect(Visible).toBe(true)
  const videoSrc = await iframeElement.getAttribute('src')
  expect(videoSrc).toBe(
    'https://www.youtube-nocookie.com/embed?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=11',
  )
  await page.locator('iframe').contentFrame().getByLabel('Play', { exact: true }).click()
  await page.locator('iframe').contentFrame().getByLabel('Pause keyboard shortcut k').click()
  await page.getByLabel('Close', { exact: true }).click()
  await page.getByLabel('לפתוח סרטון על העמוד הזה').press('ControlOrMeta+c')
})