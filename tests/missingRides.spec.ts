import { test } from '@playwright/test'
import { verifyApiCallToGtfsAgenciesList, verifyDateFromParameter } from '../tests/utils.js'

test('verify API call to gtfs_agencies/list - "missing rides"', async ({ page }) => {
  await verifyApiCallToGtfsAgenciesList(page, 'נסיעות שלא בוצעו')
})

test('Verify date_from parameter from "missing rides"', async ({ page }) => {
  await verifyDateFromParameter(page, 'נסיעות שלא בוצעו')
})
