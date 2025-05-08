import { test, expect } from '@playwright/test'

test('Verify Operators page functionality and header titles', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'חברה מפעילה' }).click()
  await page.getByRole('button', { name: 'פתח' }).click()
  await page.getByRole('option', { name: 'דן', exact: true }).click()
  await page.getByRole('textbox', { name: 'תאריך' }).click()
  await page.getByRole('textbox', { name: 'תאריך' }).fill('06/05/2024')
  await page.getByRole('textbox', { name: 'תאריך' }).press('Enter')
  await page.getByRole('button', { name: 'יומית' }).click()
  await page.getByRole('button', { name: 'שבועית' }).click()
  await page.getByRole('button', { name: 'חודשית' }).click()
  await page.waitForSelector('h2:has-text("סטטיסטיקה")')
  const h2Tags = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h2')).map((tag) => tag.textContent)
  })
  expect(h2Tags).toEqual(['דן', 'סטטיסטיקה חודשית', 'הקווים הגרועים ביותר', 'כל המסלולים'])
})
