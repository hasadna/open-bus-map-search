import { test, expect, urlMatcher, setBrowserTime, getPastDate } from './utils'
import type { Locator, Page } from '@playwright/test'

import Selectors from './SelectorsModel'

async function visitPage(page: Page, pageName: string, url: RegExp) {
  await page.goto('/')
  await page.getByText(pageName, { exact: true }).click()
  await page.waitForURL(url)
  await page.getByRole('progressbar').waitFor({ state: 'hidden' })
}

async function selectLineNumberAndRoute(page: Page, lineNumber: Locator, route: Locator) {
  await lineNumber.fill('64')
  await route.click()
  await page
    .getByRole('option', {
      name: 'הרב עובדיה יוסף/שלום צלח-פתח תקווה ⟵ מסוף כרמלית/הורדה-תל אביב יפו',
    })
    .click()
}

test.describe('clearButton functionality', () => {
  test.beforeEach(({ page, advancedRouteFromHAR }) => {
    advancedRouteFromHAR('tests/HAR/clearbutton.har', {
      updateContent: 'embed',
      update: false,
      notFound: 'abort',
      url: /stride-api/,
      matcher: urlMatcher,
    })
    setBrowserTime(getPastDate(), page)
  })

  test.describe('clearButton functionality at TimeLinePage', () => {
    test('after clear `line-number` value - should hide `stop` & `route` inputs', async ({
      page,
    }) => {
      await visitPage(page, 'לוח זמנים היסטורי', /timeline/)
      await page.getByLabel('תאריך').fill(getPastDate().toLocaleDateString('en-GB'))
      const { operator, lineNumber, route, stop } = new Selectors(page)

      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()

      await selectLineNumberAndRoute(page, lineNumber, route)
      await lineNumber.click()
      await page.getByLabel('close').locator('svg').click()
      await expect(route).not.toBeVisible()
      await expect(stop).not.toBeVisible()
    })
    test('after clear `route` input value - should hide `stop` input', async ({ page }) => {
      await visitPage(page, 'לוח זמנים היסטורי', /timeline/)
      const { operator, lineNumber, route, stop } = new Selectors(page)
      await page.getByLabel('תאריך').fill(getPastDate().toLocaleDateString('en-GB'))

      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await page.getByRole('button', { name: 'Clear' }).click()

      await expect(stop).not.toBeVisible()
    })
  })
  test.describe('clearButton functionality at GapsPage', () => {
    test('after clear LineNumber input value - stop and route inputs should be hidden', async ({
      page,
    }) => {
      await visitPage(page, 'נסיעות שלא יצאו', /gaps/)
      await page.getByLabel('תאריך').fill(getPastDate().toLocaleDateString('en-GB'))
      const { operator, lineNumber, route, stop } = new Selectors(page)

      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await page.getByLabel('רק פערים').check()
      await page.getByLabel('רק פערים').uncheck()
      await lineNumber.click()
      await page.getByLabel('close').locator('svg').click()
      await expect(route).not.toBeVisible()
      await expect(stop).not.toBeVisible()
    })
    test('after clear route input value - stop input should be hidden', async ({ page }) => {
      await visitPage(page, 'נסיעות שלא יצאו', /gaps/)
      const { operator, lineNumber, route, stop } = new Selectors(page)
      await page.getByLabel('תאריך').fill(getPastDate().toLocaleDateString('en-GB'))

      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await page.getByRole('button', { name: 'Clear' }).click()

      await expect(stop).not.toBeVisible()
    })
  })
  test.describe('clear button functionality at GapsPatternsPage', () => {
    test('after clear LineNumber input value - stop and route inputs should be hidden', async ({
      page,
    }) => {
      await visitPage(page, 'דפוסי נסיעות שלא יצאו', /gaps_patterns/)
      await page.getByLabel('התחלה').fill(getPastDate().toLocaleDateString('en-GB'))
      await page.getByLabel('סיום').fill(getPastDate().toLocaleDateString('en-GB'))
      const { operator, lineNumber, route, stop } = new Selectors(page)

      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await lineNumber.click()
      await page.getByLabel('close').locator('svg').click()
      await expect(route).not.toBeVisible()
      await expect(stop).not.toBeVisible()
    })
    test('after clear route input value - stop input should be hidden', async ({ page }) => {
      await visitPage(page, 'דפוסי נסיעות שלא יצאו', /gaps_patterns/)
      await page.getByLabel('התחלה').fill(getPastDate().toLocaleDateString('en-GB'))
      await page.getByLabel('סיום').fill(getPastDate().toLocaleDateString('en-GB'))
      const { operator, lineNumber, route, stop } = new Selectors(page)

      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await page.getByRole('button', { name: 'Clear' }).click()
      await expect(stop).not.toBeVisible()
    })
  })
  test.describe('clear button functionality at SingleLineMapPage', () => {
    test('after clear LineNumber input value - stop and route inputs should be hidden', async ({
      page,
    }) => {
      await visitPage(page, 'מפה לפי קו', /single-line/)
      await page.getByLabel('תאריך').fill(getPastDate().toLocaleDateString('en-GB'))
      const { operator, lineNumber, route, stop } = new Selectors(page)

      //clear LineNumber value test
      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await lineNumber.click()
      await page.getByLabel('close').locator('svg').click()
      await expect(route).not.toBeVisible()
      await expect(stop).not.toBeVisible()
    })
    test('after clear route input value - stop input should be hidden', async ({ page }) => {
      await visitPage(page, 'מפה לפי קו', /single-line/)
      const { operator, lineNumber, route, stop } = new Selectors(page)
      await page.getByLabel('תאריך').fill(getPastDate().toLocaleDateString('en-GB'))

      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await page.getByRole('button', { name: 'Clear' }).click()

      await expect(stop).not.toBeVisible()
    })
  })
  test.describe('clear button functionality at RealtimeMapPage', () => {
    test('after clear the `minutes` input - it should has value equals to `1`', async ({
      page,
    }) => {
      await visitPage(page, 'מפה בזמן אמת', /map/)
      const minutes = page.getByLabel('דקות')
      let getValueAttribute = await minutes.getAttribute('value')
      if (!getValueAttribute) return test.fail()
      let value = +getValueAttribute
      expect(value).toBeCloseTo(1)

      await minutes.fill('6')
      await page.getByLabel('close').locator('svg').click()
      getValueAttribute = await minutes.getAttribute('value')
      if (!getValueAttribute) return test.fail()
      value = +getValueAttribute
      expect(value).toBeCloseTo(1)
    })
  })
})
