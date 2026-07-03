import i18next from 'i18next'
import { expect, setupTest, test } from './utils'

const VIDEO_SRC =
  'https://www.youtube-nocookie.com/embed?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=11'

// Locators / accessible names used to drive the Report-a-bug UI.
const BUG_BUTTON_LABEL = 'bug'
const SVG_LOCATOR = 'svg'
const IFRAME_LOCATOR = 'iframe'
const CLOSE_BUTTON_LABEL = 'Close'
const SRC_ATTRIBUTE = 'src'
const FORM_ERROR_SELECTOR = '.ant-form-item-explain-error'

// Route matchers for hermetic network mocking.
const YOUTUBE_EMBED_PATTERN = /youtube-nocookie\.com/
const ISSUES_URL_FRAGMENT = '/issues'
const SERVER_ERROR_BODY = 'Internal Server Error'

// antd's he_IL "required" message is `בבקשה הזן ${label}`; only the label is ours.
const REQUIRED_FIELD_PREFIX = 'בבקשה הזן '

// Contact details reused across every bug-report submission.
const CONTACT = {
  name: 'Nils Holgerson',
  email: 'Muli@gmail.com',
}

// A complete, valid bug report — filled identically by the success and
// server-error submission tests.
const VALID_BUG_REPORT = {
  title: 'Test submission error',
  description: 'Testing submission error',
  environment: 'Chrome',
  expectedBehavior: 'Should submit successfully',
  actualBehavior: 'Shows error',
}

// A partial report that leaves the required "type" and "reproducibility"
// fields empty, used to trigger the missing-field validation.
const INCOMPLETE_BUG_REPORT = {
  title: 'Test!',
  description: 'חסרות הנסיעות של המפקדת אקה',
  environment: 'כרום',
  expectedBehavior: 'אקה נודדת לארצות הקור',
  actualBehavior: 'לא קיימת',
}

test.beforeEach(async ({ page }) => {
  await setupTest(page)
})

test('An instruction video for Report a bug', async ({ page }) => {
  // Block the external embed so the test stays hermetic; we assert the modal
  // wiring, not YouTube playback.
  await page.route(YOUTUBE_EMBED_PATTERN, (route) => route.abort())

  await page.getByLabel(BUG_BUTTON_LABEL).locator(SVG_LOCATOR).click()
  await page.getByLabel(i18next.t('open_video_about_this_page')).locator(SVG_LOCATOR).click()

  const videoFrame = page.locator(IFRAME_LOCATOR)
  await expect(videoFrame).toBeVisible()
  await expect(videoFrame).toHaveAttribute(SRC_ATTRIBUTE, VIDEO_SRC)

  await page.getByLabel(CLOSE_BUTTON_LABEL, { exact: true }).click()
  await expect(videoFrame).toBeHidden() // destroyOnHidden unmounts the iframe
})

test('bug missing field - request type', async ({ page }) => {
  await test.step('Open bug report modal', async () => {
    await page.getByLabel(BUG_BUTTON_LABEL).locator(SVG_LOCATOR).click()
  })

  await test.step('Fill required fields', async () => {
    await page.getByLabel(i18next.t('bug_title')).fill(INCOMPLETE_BUG_REPORT.title)
    await page.getByLabel(i18next.t('bug_contact_name')).fill(CONTACT.name)
    await page.getByLabel(i18next.t('bug_contact_email')).fill(CONTACT.email)
    await page.getByLabel(i18next.t('bug_description')).fill(INCOMPLETE_BUG_REPORT.description)
    await page.getByLabel(i18next.t('bug_environment')).fill(INCOMPLETE_BUG_REPORT.environment)
    await page
      .getByLabel(i18next.t('bug_expected_behavior'))
      .fill(INCOMPLETE_BUG_REPORT.expectedBehavior)
    await page
      .getByLabel(i18next.t('bug_actual_behavior'))
      .fill(INCOMPLETE_BUG_REPORT.actualBehavior)
  })

  await test.step('Submit the form', async () => {
    await page.getByRole('button', { name: i18next.t('bug_submit') }).click()
    await page.waitForSelector(FORM_ERROR_SELECTOR)
  })

  await test.step('Verify missing field error', async () => {
    const errorMessages = await page.locator(FORM_ERROR_SELECTOR).allTextContents()
    expect(errorMessages.length).toBe(2)
    expect(errorMessages).toContain(`${REQUIRED_FIELD_PREFIX}${i18next.t('bug_type')}`)
    expect(errorMessages).toContain(`${REQUIRED_FIELD_PREFIX}${i18next.t('bug_reproducibility')}`)
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
      (url) => url.href.includes(ISSUES_URL_FRAGMENT),
      (route) => route.fulfill({ status: 200, body: JSON.stringify(successBody) }),
    )
  })

  await test.step('Open bug report modal', async () => {
    await page.getByLabel(BUG_BUTTON_LABEL).locator(SVG_LOCATOR).click()
  })

  await test.step('Fill all required fields', async () => {
    await page.getByLabel(i18next.t('bug_type')).click()
    await page.getByText(i18next.t('bug_type_bug')).click()
    await page.getByLabel(i18next.t('bug_title')).fill(VALID_BUG_REPORT.title)
    await page.getByLabel(i18next.t('bug_contact_name')).fill(CONTACT.name)
    await page.getByLabel(i18next.t('bug_contact_email')).fill(CONTACT.email)
    await page.getByLabel(i18next.t('bug_description')).fill(VALID_BUG_REPORT.description)
    await page.getByLabel(i18next.t('bug_environment')).fill(VALID_BUG_REPORT.environment)
    await page
      .getByLabel(i18next.t('bug_expected_behavior'))
      .fill(VALID_BUG_REPORT.expectedBehavior)
    await page.getByLabel(i18next.t('bug_actual_behavior')).fill(VALID_BUG_REPORT.actualBehavior)
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
      (url) => url.href.includes(ISSUES_URL_FRAGMENT),
      (route) => route.fulfill({ status: 500, body: SERVER_ERROR_BODY }),
    )
  })

  await test.step('Open bug report modal', async () => {
    await page.getByLabel(BUG_BUTTON_LABEL).locator(SVG_LOCATOR).click()
  })

  await test.step('Fill all required fields', async () => {
    await page.getByLabel(i18next.t('bug_type')).click()
    await page.getByText(i18next.t('bug_type_bug')).click()
    await page.getByLabel(i18next.t('bug_title')).fill(VALID_BUG_REPORT.title)
    await page.getByLabel(i18next.t('bug_contact_name')).fill(CONTACT.name)
    await page.getByLabel(i18next.t('bug_contact_email')).fill(CONTACT.email)
    await page.getByLabel(i18next.t('bug_description')).fill(VALID_BUG_REPORT.description)
    await page.getByLabel(i18next.t('bug_environment')).fill(VALID_BUG_REPORT.environment)
    await page
      .getByLabel(i18next.t('bug_expected_behavior'))
      .fill(VALID_BUG_REPORT.expectedBehavior)
    await page.getByLabel(i18next.t('bug_actual_behavior')).fill(VALID_BUG_REPORT.actualBehavior)
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
