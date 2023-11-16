import { test, expect } from '@playwright/test'

test.afterEach(async ({ page }, testInfo) => {
  await page.getByRole('progressbar').waitFor({ state: 'hidden' })

  if (testInfo.title === 'test in RealtimeMapPage') return
  if (testInfo.title === 'test in GapsPatternsPage') {
    await page.getByLabel('בחירת תאריך').nth(0).click()
    await page.getByRole('gridcell', { name: '1', exact: true }).first().click()
    await page.getByLabel('בחירת תאריך').nth(1).click()
  } else {
    await page.getByLabel('בחירת תאריך').click()
  }
  //clear LineNumber value test
  await page.getByRole('gridcell', { name: '2', exact: true }).first().click()
  await page.locator('#operator-select').click()
  await page.getByRole('option', { name: 'אלקטרה אפיקים' }).click()
  await page.getByPlaceholder('לדוגמא: 17א').fill('64')
  const routeSelect = page
    .locator('div')
    .filter({ hasText: /^בחירת מסלול נסיעה/ })
    .locator('#route-select')
  const stopSelect = page.locator('#stop-select')

  await routeSelect.click()
  await page
    .getByRole('option', {
      name: 'הרב עובדיה יוסף/שלום צלח-פתח תקווה ⟵ מסוף כרמלית/הורדה-תל אביב יפו',
    })
    .click()
  if (testInfo.title === 'test in GapsPage') {
    await page.getByLabel('רק פערים').check()
    await page.getByLabel('רק פערים').uncheck()
  }
  await page.getByPlaceholder('לדוגמא: 17א').click()
  await page.getByLabel('close').locator('svg').click()
  await expect(routeSelect).not.toBeVisible()
  await expect(stopSelect).not.toBeVisible()
  //clear Operator value test
  await page.getByPlaceholder('לדוגמא: 17א').fill('64')
  await routeSelect.click()
  await page
    .getByRole('option', {
      name: 'הרב עובדיה יוסף/שלום צלח-פתח תקווה ⟵ מסוף כרמלית/הורדה-תל אביב יפו',
    })
    .click()
  await page.locator('#operator-select').click()
  await page.getByRole('button', { name: 'Clear' }).click()
  await expect(routeSelect).not.toBeVisible()
  await expect(stopSelect).not.toBeVisible()
})

test.describe('test clearButton ', () => {
  test('test in TimeLinePage', async ({ page }) => {
    await page.goto('/')
    await page.goto('/dashboard')
    await page.locator('li').filter({ hasText: 'לוח זמנים היסטורי' }).click()
    await page.waitForURL(/timeline/)
  })
  test('test in GapsPage', async ({ page }) => {
    await page.goto('/')
    await page.getByText('נסיעות שלא יצאו', { exact: true }).click()
    await page.waitForURL(/gaps/)
  })
  test('test in GapsPatternsPage', async ({ page }) => {
    await page.goto('/')
    await page.getByText('דפוסי נסיעות שלא יצאו', { exact: true }).click()
    await page.waitForURL(/gaps_patterns/)
  })
  test('test in SingleLineMapPage', async ({ page }) => {
    await page.goto('/')
    await page.getByText('מפה לפי קו', { exact: true }).click()
    await page.waitForURL(/single-line/)
  })
  test('test in RealtimeMapPage', async ({ page }) => {
    await page.goto('/')
    await page.getByText('מפה בזמן אמת', { exact: true }).click()
    await page.waitForURL(/map/)
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
