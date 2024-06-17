import type { Locator, Page } from '@playwright/test'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import { test, expect, urlMatcher, setBrowserTime, getPastDate } from './utils'

import Selectors from './SelectorsModel'

async function visitPage(page: Page, pageName: string, url: RegExp) {
  await page.goto('/')
  await page.getByText(pageName, { exact: true }).and(page.getByRole('link')).click()
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
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await i18next.use(Backend).init({
      lng: 'he',
      backend: {
        loadPath: 'src/locale/{{lng}}.json',
      },
    })

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
      await visitPage(page, i18next.t('timeline_page_title'), /timeline/)
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
      await visitPage(page, i18next.t('timeline_page_title'), /timeline/)
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
      await visitPage(page, i18next.t('gaps_page_title'), /gaps/)
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
      await visitPage(page, i18next.t('gaps_page_title'), /gaps/)
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
      await visitPage(page, i18next.t('gaps_patterns_page_title'), /gaps_patterns/)
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
      await visitPage(page, i18next.t('gaps_patterns_page_title'), /gaps_patterns/)
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
      await visitPage(page, 'מפה לפי זמן', /map/)
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
