import { expect, setupTest, test } from './utils'

const VIDEO_SRC =
  'https://www.youtube-nocookie.com/embed?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=11'

test.beforeEach(async ({ page }) => {
  await setupTest(page)
})

test('An instruction video for Report a bug', async ({ page }) => {
  await page.getByLabel('bug').locator('svg').click()
  await page.getByLabel('לפתוח סרטון על העמוד הזה').locator('svg').click()
  const videoFrame = page.locator('iframe')
  expect(videoFrame).toBeVisible()
  await expect(videoFrame).toHaveAttribute('src', VIDEO_SRC)
  await videoFrame.contentFrame().getByLabel('Play', { exact: true }).click()
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

const successBody = {
  data: {
    id: 123456,
    number: 1347,
    title: 'בדיקה',
    body: 'Fake issue body for debugging',
    labels: ['REPORTED-BY-USER'],
    state: 'open',
    created_at: '2026-01-09T11:14:11.743Z',
    url: 'https://api.github.com/repos/octocat/Hello-World/issues/1347',
    html_url: 'https://github.com/octocat/Hello-World/issues/1347',
  },
}

test('bug submission success', async ({ page }) => {
  await test.step('Mock API to return success', async () => {
    await page.route(
      (url) => url.href.includes('/issues'),
      (route) => route.fulfill({ status: 200, body: JSON.stringify(successBody) }),
    )
  })

  await test.step('Open bug report modal', async () => {
    await page.getByLabel('bug').locator('svg').click()
  })

  await test.step('Fill all required fields', async () => {
    await page.getByLabel('סוג הבקשה').click()
    await page.getByText('באג').click()
    await page.getByLabel('כותרת/סיכום').fill('Test submission error')
    await page.getByLabel('שם מלא').fill('Nils Holgerson')
    await page.getByLabel('אי-מייל').fill('Muli@gmail.com')
    await page.getByLabel('תיאור').fill('Testing submission error')
    await page.getByLabel('סביבה (דפדפן, מערכת)').fill('Chrome')
    await page.getByLabel('התנהגות צפויה').fill('Should submit successfully')
    await page.getByLabel('התנהגות נוכחית').fill('Shows error')
    await page.getByLabel('באיזו תדירות זה קורה').click()
    await page.getByText('תמיד').click()
  })

  await test.step('Submit the form', async () => {
    await page.getByRole('button', { name: 'שלח את הדוח' }).click()
  })

  await test.step('Verify error message is displayed', async () => {
    await expect(page.getByText('לצפייה בדיווח (Github)')).toBeVisible()
  })
})

test('bug submission server error', async ({ page }) => {
  await test.step('Mock API to return error', async () => {
    await page.route(
      (url) => url.href.includes('/issues'),
      (route) => route.fulfill({ status: 500, body: 'Internal Server Error' }),
    )
  })

  await test.step('Open bug report modal', async () => {
    await page.getByLabel('bug').locator('svg').click()
  })

  await test.step('Fill all required fields', async () => {
    await page.getByLabel('סוג הבקשה').click()
    await page.getByText('באג').click()
    await page.getByLabel('כותרת/סיכום').fill('Test submission error')
    await page.getByLabel('שם מלא').fill('Nils Holgerson')
    await page.getByLabel('אי-מייל').fill('Muli@gmail.com')
    await page.getByLabel('תיאור').fill('Testing submission error')
    await page.getByLabel('סביבה (דפדפן, מערכת)').fill('Chrome')
    await page.getByLabel('התנהגות צפויה').fill('Should submit successfully')
    await page.getByLabel('התנהגות נוכחית').fill('Shows error')
    await page.getByLabel('באיזו תדירות זה קורה').click()
    await page.getByText('תמיד').click()
  })

  await test.step('Submit the form', async () => {
    await page.getByRole('button', { name: 'שלח את הדוח' }).click()
  })

  await test.step('Verify error message is displayed', async () => {
    await expect(
      page.getByText('אירעה שגיאה בעת שליחת הדיווח. אנא נסה שוב מאוחר יותר.'),
    ).toBeVisible()
  })
})
