import { test } from '@playwright/test'
import { verifyApiCallToGtfsAgenciesList, verifyDateFromParameter } from '../tests/utils.js'

test('verify API call to gtfs_agencies/list - "patterns"', async ({ page }) => {
  await verifyApiCallToGtfsAgenciesList(page, 'דפוסי נסיעות שלא בוצעו')
})

test('Verify date_from parameter from "patterns"', async ({ page }) => {
  await verifyDateFromParameter(page, 'דפוסי נסיעות שלא בוצעו')
})
