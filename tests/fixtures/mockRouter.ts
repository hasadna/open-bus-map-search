import { Page } from '@playwright/test'

/**
 * Generic HTTP-mock core, shared by every backend the app talks to. It knows nothing about
 * stride or any one service — a *service binding* (e.g. tests/fixtures/stride.ts) fixes the
 * URL pattern and re-exports a named router; a *scenario* (e.g. tests/vehicleMocks.ts) pairs
 * each response body with the exact request URL it answers and hands the list to that router.
 *
 * Full-URL matching is MANDATORY. A request is served only if its whole URL matches a stub
 * exactly (pathname + every query param, order-independent, nothing ignored — deliberately
 * unlike the old HAR `urlMatcher` that dropped t/limit/date_from/date_to and rounded floats,
 * which let request bugs like a wrong date window or operator pass unnoticed). Anything else
 * is recorded as a miss (and 599'd), and the shared `test` fixture fails the test at teardown
 * listing the offending URL(s). Register all stubs for one service in a single routeService
 * call — a second call for the same pattern would shadow the first (Playwright evaluates
 * routes in reverse registration order and our handler always fulfills, never falls through).
 */
export type RouteStub = {
  /** Exact expected request — pathname + full query (order-independent, nothing ignored). */
  url: string
  body?: unknown
  status?: number
}

export const okStub = (url: string, body: unknown): RouteStub => ({ url, body })

/** An error response for an exact URL (exercises react-query retry / load-error paths). */
export const errorStub = (url: string, status = 500): RouteStub => ({ url, status })

/** Canonical form for comparison: pathname + params sorted, NOTHING dropped. */
const canon = (url: string): string => {
  const u = new URL(url, 'http://mock')
  const params = [...u.searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return `${u.pathname}?${params}`
}

const missesByPage = new Map<Page, string[]>()

/** Read and clear the requests that matched no stub for this page (across all services). */
export const takeServiceMisses = (page: Page): string[] => {
  const misses = missesByPage.get(page) ?? []
  missesByPage.delete(page)
  return misses
}

/**
 * Intercept every request whose URL matches `pattern` and answer it from `stubs` by exact
 * URL; unmatched requests are 599'd and recorded (see takeServiceMisses). Bind one of these
 * per service (stride.ts, and later backend.ts). Different patterns coexist on one page
 * because Playwright only invokes a route handler for requests matching its own pattern, so
 * a stride request never reaches the backend route and vice versa.
 */
export async function routeService(page: Page, pattern: RegExp, stubs: RouteStub[]) {
  const wanted = stubs.map((stub) => ({ stub, canon: canon(stub.url) }))
  await page.route(pattern, (route) => {
    const match = wanted.find((w) => w.canon === canon(route.request().url()))
    if (!match) {
      missesByPage.set(page, [...(missesByPage.get(page) ?? []), route.request().url()])
      return route.fulfill({
        status: 599,
        contentType: 'text/plain',
        body: 'unmocked request',
      })
    }
    const { stub } = match
    if (stub.status && stub.status >= 400) {
      return route.fulfill({ status: stub.status, contentType: 'application/json', body: '{}' })
    }
    return route.fulfill({
      status: stub.status ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(stub.body),
    })
  })
}
