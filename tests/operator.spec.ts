import type { Page } from '@playwright/test'
import i18next from 'i18next'
import { operatorList } from 'src/pages/operator/data'
import {
  expect,
  fillDateField,
  harOptions,
  setupTest,
  test,
  verifyDateFromParameter,
  visitPage,
  waitForSkeletonsToHide,
} from './utils'

const getLabelValue = async (label: string, page: Page) => {
  const row = page.locator('table tr', { hasText: label })
  return await row.locator('td').nth(1).textContent()
}

test.describe('Operator Page Tests', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/operator.har', harOptions)
    await visitPage(page, 'operator_title')
  })

  test('all inputs should be intractable', async ({ page }) => {
    await expect(page.locator('h4')).toHaveText(i18next.t('operator_title'))
    await page.getByRole('button', { name: 'פתח' }).click()
    await page.getByRole('option', { name: 'אגד', exact: true }).click()
    await fillDateField(page, 'תאריך', '06/05/2024')
    await page.getByRole('button', { name: 'יומית' }).click()
    await page.getByRole('button', { name: 'שבועית' }).click()
    await page.getByRole('button', { name: 'חודשית' }).click()
    await page.waitForSelector('h2:has-text("סטטיסטיקה")')
    const h2Tags = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h2')).map((tag) => tag.textContent)
    })
    expect(h2Tags).toHaveLength(4)
    expect(h2Tags.slice(0, 3)).toEqual(['אגד', 'סטטיסטיקה חודשית', 'הקווים הגרועים ביותר'])
    // the routes widget title may carry a "(x routes in y lines)" suffix once loaded
    expect(h2Tags[3]).toContain('כל הקווים היום')
  })

  test('Test operator inputs', async ({ page }) => {
    await test.step('Validate inputs are disabled when no operator is selected', async () => {
      await expect(page.getByRole('combobox', { name: i18next.t('choose_operator') })).toBeEmpty()
      await expect(page.locator('input.MuiPickersInputBase-input')).toBeDisabled()
      await expect(
        page.getByRole('button', { name: i18next.t('operator.time_range.day') }),
      ).toBeDisabled()
      await expect(
        page.getByRole('button', { name: i18next.t('operator.time_range.week') }),
      ).toBeDisabled()
      await expect(
        page.getByRole('button', { name: i18next.t('operator.time_range.month') }),
      ).toBeDisabled()
    })

    await test.step('Select operator', async () => {
      await page.getByRole('combobox', { name: i18next.t('choose_operator') }).click()
      await page.getByRole('option', { name: 'אגד', exact: true }).click()
    })

    await test.step('Validate inputs are enabled after selecting an operator', async () => {
      await expect(page.locator('input.MuiPickersInputBase-input')).toBeEnabled()
      await expect(
        page.getByRole('button', { name: i18next.t('operator.time_range.day') }),
      ).toBeEnabled()
      await expect(
        page.getByRole('button', { name: i18next.t('operator.time_range.day') }),
      ).toHaveAttribute('aria-pressed', 'true')
      await expect(
        page.getByRole('button', { name: i18next.t('operator.time_range.week') }),
      ).toBeEnabled()
      await expect(
        page.getByRole('button', { name: i18next.t('operator.time_range.month') }),
      ).toBeEnabled()
    })
  })

  test('Test operator info card', async ({ page }) => {
    await test.step('Select operator', async () => {
      await page.getByRole('combobox', { name: i18next.t('choose_operator') }).click()
      await page.getByRole('option', { name: 'אגד', exact: true }).click()
    })
    await test.step('Validate operator info card details', async () => {
      const id = await getLabelValue(i18next.t('operator.ref'), page)
      if (!id) {
        throw new Error('Operator ID not found in operator info card')
      }
      const operator = operatorList.find((op) => op.ref === id)
      if (!operator) {
        throw new Error(`Operator with ID ${id} not found in operator list`)
      }
      const founded = await getLabelValue(i18next.t('operator.founded'), page)
      if (founded !== '-') {
        expect(Number(founded)).toEqual(operator.founded)
      }
      const area = await getLabelValue(i18next.t('operator.area_title'), page)
      if (area !== '-') {
        expect(area).toEqual(i18next.t(`operator.area.${operator.area}`))
      }
      const type = await getLabelValue(i18next.t('operator.type_title'), page)
      if (type !== '-') {
        expect(type).toEqual(i18next.t(`operator.type.${operator.type}`))
      }
      const website = await getLabelValue(i18next.t('operator.website'), page)
      if (website !== '-') {
        expect(website).toEqual(operator.website)
      }
    })
  })

  test('Test operator gaps card', async ({ page }) => {
    await test.step('Select operator', async () => {
      await page.getByRole('combobox', { name: i18next.t('choose_operator') }).click()
      await page.getByRole('option', { name: 'אגד', exact: true }).click()
    })

    await test.step('Validate operator gaps', async () => {
      await waitForSkeletonsToHide(page)
      const planned = await getLabelValue(i18next.t('rides_planned'), page)
      const actual = await getLabelValue(i18next.t('rides_actual'), page)
      const missing = await getLabelValue(i18next.t('rides_missing'), page)
      if (planned !== '-' && actual !== '-' && missing !== '-') {
        expect(Number(missing)).toEqual(Number(planned) - Number(actual))
      } else {
        throw new Error('Operator gaps not loaded')
      }
    })
  })

  test('Test operator routes card', async ({ page }) => {
    await test.step('Select operator', async () => {
      await page.getByRole('combobox', { name: i18next.t('choose_operator') }).click()
      await page.getByRole('option', { name: 'אגד', exact: true }).click()
    })

    await test.step('Validate operator routes', async () => {
      await waitForSkeletonsToHide(page)
      // routes are grouped into one collapsible accordion per line
      const groupCount = await page.locator('.MuiAccordionSummary-root').count()
      if (groupCount === 0) {
        throw new Error('Operator routes not loaded')
      }
      // the widget title reads "<title> (<routes> routes in <lines> lines)" — the
      // lines number must match the number of rendered group headers
      const titleText = await page.getByRole('heading', { name: /כל הקווים היום/ }).textContent()
      const numbers = titleText?.match(/\d+/g)?.map(Number) ?? []
      expect(numbers[1]).toEqual(groupCount)
    })
  })

  test('Test operator routes search box', async ({ page }) => {
    // line labels rendered in the (collapsed) accordion headers
    const groupLabels = page.locator('.MuiAccordionSummary-content strong')
    const search = page.getByPlaceholder(i18next.t('operator.search_placeholder'))

    await test.step('Select operator and wait for routes', async () => {
      await page.getByRole('combobox', { name: i18next.t('choose_operator') }).click()
      await page.getByRole('option', { name: 'אגד', exact: true }).click()
      await waitForSkeletonsToHide(page)
      // the full אגד list groups into 354 lines (HAR fixture)
      await expect(groupLabels).toHaveCount(354)
    })

    await test.step('Search by line-number substring matches all lines containing it', async () => {
      // "33" must surface 33, 33א, 133, 433 — and only those
      await search.fill('33')
      await expect(groupLabels).toHaveText(['33', '33א', '133', '433'])
    })

    await test.step('Clear button restores the full list', async () => {
      await page.getByRole('button', { name: i18next.t('operator.clear') }).click()
      await expect(search).toHaveValue('')
      await expect(groupLabels).toHaveCount(354)
    })

    await test.step('Search by city name filters to the lines serving it', async () => {
      await search.fill('קרית שמונה')
      // a distinctive city narrows the list to a small subset of lines
      await expect(groupLabels).toHaveCount(12)
    })

    await test.step('Non-matching query shows the empty-results message', async () => {
      await search.fill('זזחחקק')
      await expect(page.getByText(i18next.t('operator.no_results'))).toBeVisible()
      await expect(groupLabels).toHaveCount(0)
    })
  })

  test('Verify date_from parameter from - "Operator"', async ({ page }) => {
    await verifyDateFromParameter(page)
  })
})
