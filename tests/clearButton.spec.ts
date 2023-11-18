import { test, expect, type Locator, type Page } from '@playwright/test'

import Selectors from './SelectorsModel'

async function visitPage(page: Page, pageName: string, url: RegExp) {
  await page.goto('/')
  await page.getByText(pageName, { exact: true }).click()
  await page.waitForURL(url)
  await page.getByRole('progressbar').waitFor({ state: 'hidden' })
}

async function fillDate(page: Page, twoDateElements: boolean = false) {
  if (twoDateElements) {
    await page.getByLabel('בחירת תאריך').nth(0).click()
    await page.getByRole('gridcell', { name: '1', exact: true }).first().click()
    await page.getByLabel('בחירת תאריך').nth(1).click()
  } else {
    await page.getByLabel('בחירת תאריך').click()
  }
  await page.getByRole('gridcell', { name: '2', exact: true }).first().click()
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

test.describe('test clearButton ', () => {
  test('test in TimeLinePage', async ({ page }) => {
    await visitPage(page, 'לוח זמנים היסטורי', /timeline/)
    await fillDate(page)
    const { operator, lineNumber, route, stop } = new Selectors(page)

    //clear LineNumber value test
    await operator.click()
    await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()
    await selectLineNumberAndRoute(page, lineNumber, route)
    await lineNumber.click()
    await page.getByLabel('close').locator('svg').click()
    await expect(route).not.toBeVisible()
    await expect(stop).not.toBeVisible()

    //clear Operator value test
    await selectLineNumberAndRoute(page, lineNumber, route)
    await operator.click()
    await page.getByRole('button', { name: 'Clear' }).click()
    await expect(route).not.toBeVisible()
    await expect(stop).not.toBeVisible()
  })
  test('test in GapsPage', async ({ page }) => {
    await visitPage(page, 'נסיעות שלא יצאו', /gaps/)
    await fillDate(page)
    const { operator, lineNumber, route, stop } = new Selectors(page)

    //clear LineNumber value test
    await operator.click()
    await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()
    await selectLineNumberAndRoute(page, lineNumber, route)
    await page.getByLabel('רק פערים').check()
    await page.getByLabel('רק פערים').uncheck()
    await lineNumber.click()
    await page.getByLabel('close').locator('svg').click()
    await expect(route).not.toBeVisible()
    await expect(stop).not.toBeVisible()

    //clear Operator value test
    await selectLineNumberAndRoute(page, lineNumber, route)
    await operator.click()
    await page.getByRole('button', { name: 'Clear' }).click()
    await expect(route).not.toBeVisible()
    await expect(stop).not.toBeVisible()
  })
  test('test in GapsPatternsPage', async ({ page }) => {
    await visitPage(page, 'דפוסי נסיעות שלא יצאו', /gaps_patterns/)
    await fillDate(page, true)
    const { operator, lineNumber, route, stop } = new Selectors(page)

    //clear LineNumber value test
    await operator.click()
    await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()
    await selectLineNumberAndRoute(page, lineNumber, route)
    await lineNumber.click()
    await page.getByLabel('close').locator('svg').click()
    await expect(route).not.toBeVisible()
    await expect(stop).not.toBeVisible()

    //clear Operator value test
    await selectLineNumberAndRoute(page, lineNumber, route)
    await operator.click()
    await page.getByRole('button', { name: 'Clear' }).click()
    await expect(route).not.toBeVisible()
    await expect(stop).not.toBeVisible()
  })
  test('test in SingleLineMapPage', async ({ page }) => {
    await visitPage(page, 'מפה לפי קו', /single-line/)
    await fillDate(page)
    const { operator, lineNumber, route, stop } = new Selectors(page)

    //clear LineNumber value test
    await operator.click()
    await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()
    await selectLineNumberAndRoute(page, lineNumber, route)
    await lineNumber.click()
    await page.getByLabel('close').locator('svg').click()
    await expect(route).not.toBeVisible()
    await expect(stop).not.toBeVisible()

    //clear Operator value test
    await selectLineNumberAndRoute(page, lineNumber, route)
    await operator.click()
    await page.getByRole('button', { name: 'Clear' }).click()
    await expect(route).not.toBeVisible()
    await expect(stop).not.toBeVisible()
  })
  test('test in RealtimeMapPage', async ({ page }) => {
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
