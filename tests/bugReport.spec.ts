import i18next from 'i18next'
import { expect, setupTest, test } from './utils'

const VIDEO_SRC =
  'https://www.youtube-nocookie.com/embed?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=11'

test.beforeEach(async ({ page }) => {
  await setupTest(page)
})

test('An instruction video for Report a bug', async ({ page }) => {
  // Block the external embed so the test stays hermetic; we assert the modal
  // wiring, not YouTube playback.
  await page.route(/youtube-nocookie\.com/, (route) => route.abort())

  await page.getByLabel('bug').locator('svg').click()
  await page.getByLabel(i18next.t('open_video_about_this_page')).locator('svg').click()

  const videoFrame = page.locator('iframe')
  await expect(videoFrame).toBeVisible()
  await expect(videoFrame).toHaveAttribute('src', VIDEO_SRC)

  await page.getByLabel('Close', { exact: true }).click()
  await expect(videoFrame).toBeHidden() // destroyOnHidden unmounts the iframe
})

test('bug missing field - request type', async ({ page }) => {
  await test.step('Open bug report modal', async () => {
    await page.getByLabel('bug').locator('svg').click()
  })

  await test.step('Fill required fields', async () => {
    await page.getByLabel(i18next.t('bug_title')).fill('Test!')
    await page.getByLabel(i18next.t('bug_contact_name')).fill('Nils Holgerson')
    await page.getByLabel(i18next.t('bug_contact_email')).fill('Muli@gmail.com')
    await page.getByLabel(i18next.t('bug_description')).fill('חסרות הנסיעות של המפקדת אקה')
    await page.getByLabel(i18next.t('bug_environment')).fill('כרום')
    await page.getByLabel(i18next.t('bug_expected_behavior')).fill('אקה נודדת לארצות הקור')
    await page.getByLabel(i18next.t('bug_actual_behavior')).fill('לא קיימת')
  })

  await test.step('Submit the form', async () => {
    await page.getByRole('button', { name: i18next.t('bug_submit') }).click()
    await page.waitForSelector('.ant-form-item-explain-error')
  })

  await test.step('Verify missing field error', async () => {
    const errorMessages = await page.locator('.ant-form-item-explain-error').allTextContents()
    expect(errorMessages.length).toBe(2)
    // antd's he_IL "required" message is `בבקשה הזן ${label}`; only the label is ours.
    expect(errorMessages).toContain(`בבקשה הזן ${i18next.t('bug_type')}`)
    expect(errorMessages).toContain(`בבקשה הזן ${i18next.t('bug_reproducibility')}`)
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
    await page.getByLabel(i18next.t('bug_type')).click()
    await page.getByText(i18next.t('bug_type_bug')).click()
    await page.getByLabel(i18next.t('bug_title')).fill('Test submission error')
    await page.getByLabel(i18next.t('bug_contact_name')).fill('Nils Holgerson')
    await page.getByLabel(i18next.t('bug_contact_email')).fill('Muli@gmail.com')
    await page.getByLabel(i18next.t('bug_description')).fill('Testing submission error')
    await page.getByLabel(i18next.t('bug_environment')).fill('Chrome')
    await page.getByLabel(i18next.t('bug_expected_behavior')).fill('Should submit successfully')
    await page.getByLabel(i18next.t('bug_actual_behavior')).fill('Shows error')
    await page.getByLabel(i18next.t('bug_reproducibility')).click()
    await page.getByText(i18next.t('bug_frequency.always')).click()
  })

  await test.step('Submit the form', async () => {
    await page.getByRole('button', { name: i18next.t('bug_submit') }).click()
  })

  await test.step('Verify success message is displayed', async () => {
    await expect(page.getByText(i18next.t('reportBug.viewIssue'))).toBeVisible()
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
    await page.getByLabel(i18next.t('bug_type')).click()
    await page.getByText(i18next.t('bug_type_bug')).click()
    await page.getByLabel(i18next.t('bug_title')).fill('Test submission error')
    await page.getByLabel(i18next.t('bug_contact_name')).fill('Nils Holgerson')
    await page.getByLabel(i18next.t('bug_contact_email')).fill('Muli@gmail.com')
    await page.getByLabel(i18next.t('bug_description')).fill('Testing submission error')
    await page.getByLabel(i18next.t('bug_environment')).fill('Chrome')
    await page.getByLabel(i18next.t('bug_expected_behavior')).fill('Should submit successfully')
    await page.getByLabel(i18next.t('bug_actual_behavior')).fill('Shows error')
    await page.getByLabel(i18next.t('bug_reproducibility')).click()
    await page.getByText(i18next.t('bug_frequency.always')).click()
  })

  await test.step('Submit the form', async () => {
    await page.getByRole('button', { name: i18next.t('bug_submit') }).click()
  })

  await test.step('Verify error message is displayed', async () => {
    await expect(page.getByText(i18next.t('reportBug.error'))).toBeVisible()
  })
})
