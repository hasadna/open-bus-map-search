import { Page } from '@playwright/test'
import { routeService, RouteStub, unrouteStubs } from './mockRouter'

/**
 * Stride-api binding of the generic mock router (tests/fixtures/mockRouter.ts). Stride is the
 * app's public-transport data service (VITE_STRIDE_API); its requests are identified by the
 * `/stride-api/` substring of its host. Scenario files (e.g. tests/vehicleMocks.ts) build the
 * typed bodies (siri.ts, gtfs.ts), pair each with its exact request URL as a StrideStub, and
 * hand the list to `routeStride`. Mandatory full-URL matching, miss enforcement and stub
 * layering live in the generic core — see mockRouter.ts for the rules.
 */
export type StrideStub = RouteStub

export { okStub, errorStub } from './mockRouter'

const STRIDE = /stride-api/

/** Register stride stubs. Repeatable: stubs merge, and a repeated URL replaces the earlier one. */
export const routeStride = (page: Page, stubs: StrideStub[]) => routeService(page, STRIDE, stubs)

/** Remove stride stubs a lower layer registered, making those URLs misses again. */
export const unrouteStride = (page: Page, urls: string[]) => unrouteStubs(page, STRIDE, urls)
