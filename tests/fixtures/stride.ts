import { Page } from '@playwright/test'
import { routeService, RouteStub } from './mockRouter'

/**
 * Stride-api binding of the generic mock router (tests/fixtures/mockRouter.ts). Stride is the
 * app's public-transport data service (VITE_STRIDE_API); its requests are identified by the
 * `/stride-api/` substring of its host. Scenario files (e.g. tests/vehicleMocks.ts) build the
 * typed bodies (siri.ts, gtfs.ts), pair each with its exact request URL as a StrideStub, and
 * hand the list to `routeStride`. Mandatory full-URL matching and miss enforcement live in
 * the generic core — see mockRouter.ts for the rules.
 */
export type StrideStub = RouteStub

export { okStub, errorStub } from './mockRouter'

/** Register every stride stub for a page in ONE call (a second call would shadow the first). */
export const routeStride = (page: Page, stubs: StrideStub[]) =>
  routeService(page, /stride-api/, stubs)
