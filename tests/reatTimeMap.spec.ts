import { test } from '@playwright/test'
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

test('real time map page', async ({ page }) => {
  await page.goto('/map')
  await sleep(444)
  await page.getByRole('button', { name: '68 68 אוטובוסים' }).click();
  await page.getByRole('button', { name: '29 29 אוטובוסים' }).click();
  await page.getByRole('button', { name: '10 10 אוטובוסים' }).click();
  await page.getByRole('button', { name: '3 3 אוטובוסים' }).first().click();
  await page.locator('div:nth-child(10)').click();
})
