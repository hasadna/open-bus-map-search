import { GtfsRoutePydanticModel, GtfsRoutePydanticModelToJSON } from '@hasadna/open-bus-api-client'
import { FIXTURE_DATE } from './date'

/**
 * GTFS (planned) domain fixtures. Same pattern as siri.ts: typed camelCase builder in,
 * exact snake_case wire out via the client's `…ToJSON`. `GtfsRoutePydanticModel` has four
 * required fields (`id`, `date`, `lineRef`, `operatorRef`), so the builder defaults them;
 * callers override only what their scenario asserts on.
 */
export const gtfsRoute = (
  overrides: Partial<GtfsRoutePydanticModel> = {},
): GtfsRoutePydanticModel => ({
  id: 0,
  date: new Date(`${FIXTURE_DATE}T00:00:00Z`),
  lineRef: 0,
  operatorRef: 0,
  ...overrides,
})

export const gtfsRoutesWire = (routes: GtfsRoutePydanticModel[]): unknown[] =>
  routes.map(GtfsRoutePydanticModelToJSON)
