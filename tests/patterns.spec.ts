import { test } from '@playwright/test'
import { expect } from './utils'

test('verify API call to gtfs_agencies/list - "patterns"', async ({ page }) => {
  const callAssertion = expect(page).toCall('gtfs_agencies/list')

  await page.goto('/')
  await page.getByRole('link', { name: 'דפוסי נסיעות שלא בוצעו', exact: true }).click()
  await page.getByLabel('חברה מפעילה').click()

  await callAssertion
})

test('Verify date_from parameter from "patterns"', async ({ page }) => {
  const dateAssertion = expect(page).toHaveRecentDateFrom('gtfs_agencies/list')

  await page.goto('/')
  await page.getByRole('link', { name: 'דפוסי נסיעות שלא בוצעו', exact: true }).click()

  await dateAssertion
})
