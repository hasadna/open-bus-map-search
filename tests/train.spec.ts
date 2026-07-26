import i18next from 'i18next'
import { expect, getPastDate, harOptions, setupTest, test } from './utils'

const TRAIN_ROUTE = 'באר שבע מרכז-באר שבע<->תל אביב מרכז-תל אביב יפו'

const TRAIN_TEST_DATE = new Date(getPastDate().getTime() - 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10)

test.describe('Train page', () => {
  test('loads a selected route and opens its ride map', async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/train.har', harOptions)
    await page.goto(`/train?date=${TRAIN_TEST_DATE}`)
    await page.locator('.preloader').waitFor({ state: 'hidden' })

    const routeSelect = page.getByRole('combobox', { name: i18next.t('train_choose_route') })
    await routeSelect.click()
    await page.getByRole('option', { name: TRAIN_ROUTE }).click()

    await expect(routeSelect).toContainText(TRAIN_ROUTE)
    await expect(page.getByText(/נסיעה 30086 · שעה מתוכננת 08:41 · מספר רכבת 28/)).toBeVisible()
    await expect(
      page.locator('.recharts-wrapper').getByText('באר שבע מרכז', { exact: true }),
    ).toBeVisible()

    const showMap = page.getByRole('button', { name: i18next.t('train_show_ride_map') })
    await showMap.click()

    await expect(
      page.getByRole('button', { name: i18next.t('train_hide_ride_map') }),
    ).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('.leaflet-container')).toBeVisible()
  })
})
