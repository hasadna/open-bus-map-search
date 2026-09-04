import i18next from 'i18next'
import { expect, getPastTrainDate, harOptions, setupTest, test } from './utils'

const TRAIN_ROUTE = 'באר שבע מרכז-באר שבע<->תל אביב מרכז-תל אביב יפו'

const TRAIN_TEST_DATE = new Date(getPastTrainDate().getTime() - 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10)

test.describe('Train page', () => {
  test('loads a selected route and opens its ride map', async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await page.clock.setSystemTime(getPastTrainDate())
    await advancedRouteFromHAR('tests/HAR/train.har', harOptions)
    await page.goto(`/train?date=${TRAIN_TEST_DATE}`)
    await page.locator('.preloader').waitFor({ state: 'hidden' })

    const routeSelect = page.getByRole('combobox', { name: i18next.t('train_choose_route') })
    await routeSelect.click()
    await page.getByRole('option', { name: TRAIN_ROUTE }).click()

    await expect(routeSelect).toContainText(TRAIN_ROUTE)
    const rideHeading = page.getByRole('heading', {
      name: /נסיעה 30093 · שעה מתוכננת 11:41 · מספר רכבת 34 · נקודות מיקום 102 · תחנות 11/,
    })
    await expect(rideHeading).toBeVisible()
    const averageDelayWidget = page
      .getByRole('heading', { name: i18next.t('train_average_delay_title') })
      .locator('..')
    await expect(averageDelayWidget.getByText('באר שבע מרכז', { exact: true })).toBeVisible()

    const rideWidget = rideHeading.locator('..')
    await rideWidget.getByRole('button', { name: i18next.t('train_show_ride_map') }).click()
    await expect(
      rideWidget.getByRole('button', { name: i18next.t('train_hide_ride_map') }),
    ).toHaveAttribute('aria-expanded', 'true')
    await expect(rideWidget.locator('.leaflet-container')).toBeVisible()
  })
})
