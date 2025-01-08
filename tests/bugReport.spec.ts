import { test, expect } from '@playwright/test'

test('the YouTube modal in "report a bug" is visible and have the correct src', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('bug').locator('svg').click()
  await page.getByLabel('לפתוח סרטון על העמוד הזה').locator('svg').click()
  const iframeElement = await page.waitForSelector('iframe')

  // const Visible = await iframeElement.isVisible()
  // expect(Visible).toBe(true)

  // A specific element is visible.
  // await expect(page.getBy
  //await expect(page.getByTitle('YouTube video player')).toBeVisible();
  expect(iframeElement.isVisible())

  // // At least one item in the list is visible.
  // //await expect(page.getByTestId('todo-item').first()).toBeVisible();

  // // At least one of the two elements is visible, possibly both.
  // await expect(
  //     page.getByRole('button', { name: 'Sign in' })
  //         .or(page.getByRole('button', { name: 'Sign up' }))
  //         .first()
  // ).toBeVisible();

  const videoSrc = page.locator('iframe')
  await expect(videoSrc).toHaveAttribute(
    'src',
    'https://www.youtube-nocookie.com/embed?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=11',
  )
  await page.locator('iframe').contentFrame().getByLabel('Play', { exact: true }).click()
  await page.locator('iframe').contentFrame().getByLabel('Pause keyboard shortcut k').click()
  await page.getByLabel('Close', { exact: true }).click()
  await page.getByLabel('לפתוח סרטון על העמוד הזה').press('ControlOrMeta+c')
})
