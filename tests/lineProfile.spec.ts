import { expect, harOptions, setupTest, test } from './utils'

test.describe('Line Profile', () => {
  test.beforeEach(async ({ page }) => {
    await setupTest(page)
  })

  test('shows not-found message when route id is invalid', async ({ page }) => {
    await page.goto('/profile/not-a-valid-id')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('לא הצלחנו למצוא את הקו שחיפשת :(')).toBeVisible()
  })

  test('shows not-found message when route id does not exist', async ({ page }) => {
    // stride-api is blocked by setupTest so any numeric id will fail with a network error
    await page.goto('/profile/9999999')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('לא הצלחנו למצוא את הקו שחיפשת :(')).toBeVisible()
  })
})

test.describe('Line Profile — loaded from URL', () => {
  test.beforeEach(async ({ page, advancedRouteFromHAR }) => {
    await setupTest(page)
    await advancedRouteFromHAR('tests/HAR/lineprofile.har', harOptions)
  })

  // Anti-regression for the routeKey + routeAlternative fix
  // (LineProfile.tsx, commit cd8921a).
  //
  // Before the fix LineProfile built routeKey as `${mkt}-${direction}`, while the
  // BusRoute model used `${mkt}-${direction}-${alternative}`. With the mismatched
  // key, `routes?.find((r) => r.key === routeKey)` returned undefined for every
  // route whenever multiple alternatives shared the same (mkt, direction), so
  // `useSingleLineData` never had a `selectedRoute`, never fetched siri_rides, and
  // the start-time dropdown stayed empty.
  //
  // Observable signal: after navigating directly to /profile/{id}, the start-time
  // dropdown becomes editable only when the routeKey resolved to a real route with
  // a lineRef. If it stays disabled, the lookup is broken.
  test('renders route from URL and populates start-time options', async ({ page }) => {
    await page.goto('/profile/4339841')
    await page.waitForLoadState('networkidle')

    // Loader succeeded — not the not-found state.
    await expect(page.getByText('לא הצלחנו למצוא את הקו שחיפשת :(')).not.toBeAttached()

    // Route-select dropdown holds the route loaded from the URL.
    await expect(page.getByLabel(/בחירת מסלול נסיעה/)).toHaveValue(/.+/, { timeout: 10000 })

    // Start-time dropdown becomes editable only after routeKey → selectedRoute → lineRef
    // resolves and siri_rides/list returns options.
    await expect(page.locator('#start-time-select')).toBeEditable({ timeout: 10000 })
    await page.getByLabel('בחירת שעת התחלה').click()
    expect(await page.getByRole('option').count()).toBeGreaterThan(0)
  })
})
