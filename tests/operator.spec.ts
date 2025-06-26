import { expect, test, type Page } from '@playwright/test'
import i18next from 'i18next'
import { getPastDate, loadTranslate, waitForSkeletonsToHide } from './utils'
import { operatorList } from 'src/pages/operator/data'

const getLabelValue = async (label: string, page: Page) => {
  const row = page.locator('table tr', { hasText: label })
  return await row.locator('td').nth(1).textContent()
}

const selectRandomOperator = async (label: string, page: Page) => {
  await page.getByRole('combobox', { name: label }).click()
  const options = page.getByRole('option')
  const optionsCount = await options.count()
  const randomIndex = Math.floor(Math.random() * optionsCount)
  await options.nth(randomIndex).scrollIntoViewIfNeeded()
  await options.nth(randomIndex).click()
  return options.nth(randomIndex)
}

test.describe('Operator Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/google-analytics\.com|googletagmanager\.com/, (route) => route.abort())
    await loadTranslate(i18next)
    await page.clock.setSystemTime(getPastDate())
    await page.goto('/')
    await page
      .getByText(i18next.t('operator_title'), { exact: true })
      .and(page.getByRole('link'))
      .click()
    await page.getByRole('progressbar').waitFor({ state: 'hidden' })
    await test.step('Validate that the test is on the correct page', async () => {
      await expect(page).toHaveURL(/operator/)
      await expect(page.locator('h4')).toHaveText(i18next.t('operator_title'))
    })
  })

  test('all inputs should be intractable', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'חברה מפעילה' }).click()
    await page.getByRole('button', { name: 'פתח' }).click()
    await page.getByRole('option', { name: 'דן', exact: true }).click()
    await page.getByRole('textbox', { name: 'תאריך' }).click()
    await page.getByRole('textbox', { name: 'תאריך' }).fill('06/05/2024')
    await page.getByRole('textbox', { name: 'תאריך' }).press('Enter')
    await page.getByRole('button', { name: 'יומית' }).click()
    await page.getByRole('button', { name: 'שבועית' }).click()
    await page.getByRole('button', { name: 'חודשית' }).click()
    await page.waitForSelector('h2:has-text("סטטיסטיקה")')
    const h2Tags = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h2')).map((tag) => tag.textContent)
    })
    expect(h2Tags).toEqual(['דן', 'סטטיסטיקה חודשית', 'הקווים הגרועים ביותר', 'כל המסלולים'])
  })

  test('Test operator inputs', async ({ page }) => {
    await test.step('Validate inputs are disabled when no operator is selected', async () => {
      await expect(page.getByRole('combobox', { name: i18next.t('choose_operator') })).toBeEmpty()
      await expect(page.getByRole('textbox', { name: i18next.t('choose_date') })).toBeDisabled()
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

    await test.step('Select a random operator', async () => {
      await selectRandomOperator(i18next.t('choose_operator'), page)
    })

    await test.step('Validate inputs are enabled after selecting an operator', async () => {
      await expect(page.getByRole('textbox', { name: i18next.t('choose_date') })).toBeEnabled()
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
    await test.step('Select a random operator', async () => {
      await selectRandomOperator(i18next.t('choose_operator'), page)
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
    await test.step('Select a random operator', async () => {
      await selectRandomOperator(i18next.t('choose_operator'), page)
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
    await test.step('Select a random operator', async () => {
      await selectRandomOperator(i18next.t('choose_operator'), page)
    })

    await test.step('Validate operator routes', async () => {
      await waitForSkeletonsToHide(page)
      const table = page.locator('table').nth(2)
      const rows = table.locator('tbody tr')
      const totalText = await page.getByText(i18next.t('operator.total')).textContent()
      const total = Number(totalText?.split(' ')[i18next.language === 'en' ? 2 : 3] || 0)
      if (total !== 0) {
        const rowsCount = await rows.count()
        expect(rowsCount).toEqual(total)
      } else {
        throw new Error('Operator routes not loaded')
      }
    })
  })
})
