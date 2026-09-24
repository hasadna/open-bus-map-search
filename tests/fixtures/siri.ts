import {
  SiriRideWithRelatedPydanticModel,
  SiriRideWithRelatedPydanticModelToJSON,
} from '@hasadna/open-bus-api-client'
import { FIXTURE_DATE } from './date'

/**
 * SIRI (real-time) domain fixtures. Builders take a typed *camelCase* partial of the
 * generated client model and fill defaults; `…Wire` serializes through the client's own
 * `…ToJSON` so the body is the exact snake_case shape the client re-parses
 * (e.g. `siri_route__line_ref`, `scheduled_start_time`). See tests/fixtures/stride.ts for
 * how a body is paired with its golden request URL.
 */
export const siriRide = (
  overrides: Partial<SiriRideWithRelatedPydanticModel> = {},
): SiriRideWithRelatedPydanticModel => ({
  scheduledStartTime: new Date(`${FIXTURE_DATE}T12:00:00Z`),
  ...overrides,
})

export const siriRidesWire = (rides: SiriRideWithRelatedPydanticModel[]): unknown[] =>
  rides.map(SiriRideWithRelatedPydanticModelToJSON)
