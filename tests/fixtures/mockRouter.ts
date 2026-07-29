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
 * listing the offending URL(s).
 *
 * Stubs LAYER. Each call merges into one per-page registry keyed by the canonical URL, so a
 * later stub for the same URL replaces the earlier one and every other stub survives — which
 * is what lets a default catalogue (tests/fixtures/defaults.ts) be installed once for the whole
 * suite and a single test override just the URL it is about. Only the FIRST call per service
 * installs a Playwright route; the handler reads the registry at request time, so what matters
 * is that a stub is registered before the navigation that needs it, not the order the calls
 * were made in. (Registering a second `page.route` per pattern would instead shadow the first
 * entirely: Playwright evaluates handlers in reverse registration order and ours always
 * fulfills, never falls through. The registry is what replaces that broken layering.)
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

type ServiceState = { stubs: Map<string, RouteStub>; misses: string[]; installed: boolean }

/** Per page, per service pattern. WeakMap so a closed page's state cannot outlive it. */
const servicesByPage = new WeakMap<Page, Map<string, ServiceState>>()

const stateFor = (page: Page, pattern: RegExp): ServiceState => {
  let services = servicesByPage.get(page)
  if (!services) {
    services = new Map<string, ServiceState>()
    servicesByPage.set(page, services)
  }
  let state = services.get(pattern.source)
  if (!state) {
    state = { stubs: new Map(), misses: [], installed: false }
    services.set(pattern.source, state)
  }
  return state
}

/** Read and clear the requests that matched no stub for this page (across all services). */
export const takeServiceMisses = (page: Page): string[] => {
  const services = servicesByPage.get(page)
  if (!services) return []
  const misses = [...services.values()].flatMap((state) => state.misses)
  services.forEach((state) => (state.misses.length = 0))
  return misses
}

/**
 * Intercept every request whose URL matches `pattern` and answer it from `stubs` by exact
 * URL; unmatched requests are 599'd and recorded (see takeServiceMisses). Bind one of these
 * per service (stride.ts, and later backend.ts). Different patterns coexist on one page
 * because Playwright only invokes a route handler for requests matching its own pattern, so
 * a stride request never reaches the backend route and vice versa.
 *
 * Call it as often as you like for the same service: stubs merge, last one wins per URL.
 */
export async function routeService(page: Page, pattern: RegExp, stubs: RouteStub[]) {
  const state = stateFor(page, pattern)
  for (const stub of stubs) state.stubs.set(canon(stub.url), stub)
  if (state.installed) return
  state.installed = true

  await page.route(pattern, (route) => {
    const stub = state.stubs.get(canon(route.request().url()))
    if (!stub) {
      state.misses.push(route.request().url())
      return route.fulfill({
        status: 599,
        contentType: 'text/plain',
        body: 'unmocked request',
      })
    }
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

/**
 * Drop stubs a lower layer registered, so those URLs become misses again. This is how a test
 * asserts a request must NOT be issued: remove the default and the test fails at teardown if
 * the app asks for it anyway.
 */
export const unrouteStubs = (page: Page, pattern: RegExp, urls: string[]) => {
  const state = stateFor(page, pattern)
  urls.forEach((url) => state.stubs.delete(canon(url)))
}
