import i18next from 'i18next'
import { expect, setupTest, test } from './utils'

test.describe('Donate Modal Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
  })

  test('clicking donate menu item opens the modal', async ({ page }) => {
    const donateLink = page.locator('li a', { hasText: i18next.t('donate_title') })
    await donateLink.click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(
      page.getByRole('heading', { name: i18next.t('how_to_donate_title') }),
    ).toBeVisible()
  })

  test('modal contains donation link to jgive.com', async ({ page }) => {
    const donateLink = page.locator('li a', { hasText: i18next.t('donate_title') })
    await donateLink.click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    const jgiveLink = modal.locator('a[href*="jgive.com"]').first()
    await expect(jgiveLink).toBeVisible()
    await expect(jgiveLink).toHaveAttribute('href', /jgive\.com/)
  })

  test('modal contains bank transfer details', async ({ page }) => {
    const donateLink = page.locator('li a', { hasText: i18next.t('donate_title') })
    await donateLink.click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByText(i18next.t('donation_through_bank_title'))).toBeVisible()
    await expect(modal.getByText(i18next.t('donation_through_bank_details_account'))).toBeVisible()
  })

  test('modal can be closed', async ({ page }) => {
    const donateLink = page.locator('li a', { hasText: i18next.t('donate_title') })
    await donateLink.click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    // Close button is the X button inside the modal
    const closeButton = modal.locator('button').first()
    await closeButton.click()
    await expect(modal).toBeHidden()
  })
})
