import { expect, setupTest, test } from './utils'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
  })

  test('shows welcome heading and tagline', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'ברוכים הבאים לדאטאבוס', level: 1 }),
    ).toBeVisible()
    await expect(
      page.getByText('הפלטפורמה הפתוחה לנתוני אמת על איכות קווי התחבורה הציבורית בישראל'),
    ).toBeVisible()
  })

  test('shows bus illustration image', async ({ page }) => {
    await expect(page.getByRole('img', { name: 'איור של אוטובוס תחבורה ציבורית' })).toBeVisible()
  })

  test('shows links to all main pages', async ({ page }) => {
    const links = page.locator('.links.hideOnMobile')
    await expect(links.getByText('מסלול נסיעה')).toBeVisible()
    await expect(links.getByText('היסטוריית נסיעות')).toBeVisible()
    await expect(links.getByText('נסיעות שלא בוצעו', { exact: true })).toBeVisible()
    await expect(links.getByText('דפוסי נסיעות שלא בוצעו')).toBeVisible()
    await expect(links.getByText('חברה מפעילה')).toBeVisible()
    await expect(links.getByText('מפת תחבורה')).toBeVisible()
  })

  test('clicking a page link navigates to that page', async ({ page }) => {
    const singleLineLink = page
      .locator('.page-link', { hasText: 'מסלול נסיעה' })
      .getByRole('link', { name: 'הצג' })
    await singleLineLink.click()
    await expect(page).toHaveURL(/single-line-map/)
  })

  test('shows copyright in footer', async ({ page }) => {
    await expect(page.locator('footer')).toContainText('© הסדנא לידע ציבורי')
  })
})
