import { expect, setupTest, test } from './utils'

const VIDEO_SRC =
  'https://www.youtube-nocookie.com/embed?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=11'

test.beforeEach(async ({ page }) => {
  await setupTest(page)
})

test('An instruction video for Report a bug', async ({ page }) => {
  await page.route(/youtube-nocookie\.com/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<html><body><button aria-label="Play">Play</button></body></html>',
    }),
  )
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
  })

  await test.step('Verify missing field error', async () => {
    await expect(page.getByText('סוג הבקשה הוא שדה חובה', { exact: true })).toBeVisible()
    await expect(page.getByText('באיזו תדירות זה קורה הוא שדה חובה', { exact: true })).toBeVisible()
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
      (url) => url.pathname.endsWith('/issues/create'),
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

  await test.step('Verify success dialog is displayed', async () => {
    const dialog = page.getByRole('dialog', { name: 'הדיווח נשלח' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'לצפייה בדיווח' })).toHaveAttribute(
      'href',
      successBody.data.url,
    )
  })
})

test('bug submission server error', async ({ page }) => {
  await test.step('Mock API to return error', async () => {
    await page.route(
      (url) => url.pathname.endsWith('/issues/create'),
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
