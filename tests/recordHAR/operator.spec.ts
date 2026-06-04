import { goToPage, recordTest } from './utils'

recordTest('operator.har', async (page) => {
  await goToPage(page, '/')
  await goToPage(page, '/operator')

  // Open operator dropdown (triggers gtfs_agencies/list)
  await page.getByRole('button', { name: 'פתח' }).click()
  await page.waitForLoadState('networkidle')

  // Select אגד — triggers group_by × 2 + gtfs_routes/list via React state update.
  // Register all three response promises before clicking so none are missed.
  const groupByOperatorPromise = page.waitForResponse(
    (response) =>
      response.url().includes('/gtfs_rides_agg/group_by') &&
      response.url().includes('group_by=operator_ref') &&
      !response.url().includes('line_ref'),
  )
  const groupByLinePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/gtfs_rides_agg/group_by') && response.url().includes('line_ref'),
  )
  const routesPromise = page.waitForResponse(
    (response) =>
      response.url().includes('/gtfs_routes/list') && response.url().includes('limit=15000'),
  )
  await page.getByRole('option', { name: 'אגד', exact: true }).click()
  const [groupByOperatorResponse, groupByLineResponse, routesResponse] = await Promise.all([
    groupByOperatorPromise,
    groupByLinePromise,
    routesPromise,
  ])
  await Promise.all([
    groupByOperatorResponse.body(),
    groupByLineResponse.body(),
    routesResponse.body(),
  ])
  await page.waitForLoadState('networkidle')
})
