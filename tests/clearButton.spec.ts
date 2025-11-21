import type { Locator, Page } from '@playwright/test'
import Selectors from './SelectorsModel'
import { expect, getPastDate, harOptions, setupTest, test, visitPage } from './utils'

async function selectLineNumberAndRoute(page: Page, lineNumber: Locator, route: Locator) {
  await lineNumber.fill('64')
  await route.click()
  await page
    .getByRole('option', {
      name: 'הרב עובדיה יוסף/שלום צלח-פתח תקווה ⟵ מסוף כרמלית/הורדה-תל אביב יפו',
    })
    .click()
}

async function clearInput(page: Page) {
  await page.getByLabel('close').locator('svg').click()
}

async function clickClearButton(page: Page) {
  await page.getByRole('button', { name: 'נקה' }).click()
}

test.describe('clearButton functionality', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/clearbutton.har', harOptions)
  })

  test.describe('clearButton functionality at TimeLinePage', () => {
    test('after clear `line-number` value - should hide `stop` & `route` inputs', async ({
      page,
    }) => {
      await visitPage(page, 'timeline_page_title')
      await page.getByLabel('תאריך').fill(getPastDate().toLocaleDateString('en-GB'))
      const { operator, lineNumber, route, stop } = new Selectors(page)

      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true }).click()

      await selectLineNumberAndRoute(page, lineNumber, route)
      await lineNumber.click()
      await stop.waitFor({ state: 'visible' })
      await clearInput(page)
      await expect(route).not.toBeVisible()
      await expect(stop).not.toBeVisible()
    })

    test('after clear `route` input value - should hide `stop` input', async ({ page }) => {
      await visitPage(page, 'timeline_page_title')
      const { operator, lineNumber, route, stop } = new Selectors(page)
      await page.getByLabel('תאריך').fill(getPastDate().toLocaleDateString('en-GB'))
      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await stop.waitFor({ state: 'visible' })
      await clickClearButton(page)
      await expect(stop).not.toBeVisible()
    })
  })

  test.describe('clearButton functionality at GapsPage', () => {
    test('after clear LineNumber input value - route inputs should be disable', async ({
      page,
    }) => {
      await visitPage(page, 'gaps_page_title')
      await page.getByLabel('תאריך').fill(getPastDate().toLocaleDateString('en-GB'))
      const { operator, lineNumber, route } = new Selectors(page)
      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await lineNumber.click()
      await route.waitFor({ state: 'visible' })
      await clearInput(page)
      await expect(route).toBeDisabled()
    })

    test('after clear route input value - stop input should be hidden', async ({ page }) => {
      await visitPage(page, 'gaps_page_title')
      const { operator, lineNumber, route, stop } = new Selectors(page)
      await page.getByLabel('תאריך').fill(getPastDate().toLocaleDateString('en-GB'))
      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await expect(stop).not.toBeVisible()
    })
  })
  test.describe('clear button functionality at GapsPatternsPage', () => {
    test('after clear LineNumber input value - stop and route inputs should be hidden', async ({
      page,
    }) => {
      await visitPage(page, 'gaps_patterns_page_title')
      await page.getByLabel('התחלה').fill(getPastDate().toLocaleDateString('en-GB'))
      await page.getByLabel('סיום').fill(getPastDate().toLocaleDateString('en-GB'))
      const { operator, lineNumber, route, stop } = new Selectors(page)
      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await lineNumber.click()
      await clearInput(page)
      await expect(route).not.toBeVisible()
      await expect(stop).not.toBeVisible()
    })

    test('after clear route input value - stop input should be hidden', async ({ page }) => {
      await visitPage(page, 'gaps_patterns_page_title')
      await page.getByLabel('התחלה').fill(getPastDate().toLocaleDateString('en-GB'))
      await page.getByLabel('סיום').fill(getPastDate().toLocaleDateString('en-GB'))
      const { operator, lineNumber, route, stop } = new Selectors(page)
      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await clickClearButton(page)
      await expect(stop).not.toBeVisible()
    })
  })
  test.describe('clear button functionality at SingleLineMapPage', () => {
    test('after clear LineNumber input value - stop and route inputs should be hidden', async ({
      page,
    }) => {
      await visitPage(page, 'singleline_map_page_title')
      await page.getByLabel('תאריך').fill(getPastDate().toLocaleDateString('en-GB'))
      const { operator, lineNumber, route, stop } = new Selectors(page)
      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await lineNumber.click()
      await clearInput(page)
      await expect(route).toBeDisabled()
      await expect(stop).toBeHidden()
    })

    test('after clear route input value - stop input should be hidden', async ({ page }) => {
      await visitPage(page, 'singleline_map_page_title')
      const { operator, lineNumber, route, stop } = new Selectors(page)
      await page.getByLabel('תאריך').fill(getPastDate().toLocaleDateString('en-GB'))
      await operator.click()
      await page.getByRole('option', { name: 'אלקטרה אפיקים', exact: true }).click()
      await selectLineNumberAndRoute(page, lineNumber, route)
      await clickClearButton(page)
      await expect(stop).not.toBeVisible()
    })
  })

  test.describe('clear button functionality at RealtimeMapPage', () => {
    test('after clear the `minutes` input - it should has value equals to `1`', async ({
      page,
    }) => {
      await visitPage(page, 'time_based_map_page_title')
      const minutes = page.getByLabel('דקות')
      const initialValue = await minutes.getAttribute('value')
      expect(+initialValue!).toBeCloseTo(1)

      await minutes.fill('6')
      await clearInput(page)
      const clearedValue = await minutes.getAttribute('value')
      expect(+clearedValue!).toBeCloseTo(1)
    })
  })
})
