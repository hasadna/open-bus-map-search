import { utcDayBeforeClock } from './date'
import { gtfsAgenciesWire, gtfsAgency } from './gtfs'
import { okStub, StrideStub } from './stride'

/**
 * The DEFAULT stride world: the endpoints the app asks for on its own, on many pages, that no
 * single test is about. Installed once per test (`setupTest(page, lng, strideDefaults())`) and
 * layered under the scenario; any test that IS about one of these URLs re-stubs it and wins
 * (stubs merge, last one per URL wins — see tests/fixtures/mockRouter.ts).
 *
 * A default is still an exact-URL link from one request to one built fixture — nothing here
 * relaxes matching. That is what makes the agency list expressible despite its retry loop.
 *
 * Covering an endpoint a page MIGHT ask for is the point, so a default going unrequested is
 * normal and costs nothing: only an unmatched REQUEST fails a test (tests/fixtures/mockRouter.ts),
 * never an unused stub. Installing the whole catalogue on a page that uses none of it — /vehicle,
 * which never calls getAgencyList — is therefore free.
 */

/**
 * `getAgencyList()` (src/api/agencyList.ts) walks three dates until one returns a non-empty
 * list: now−1d, now−7d, then a hard-coded 2025-05-18 fallback. All three are exact URLs under
 * the emulated clock, so all three are stubbed with the same fixture — the retry loop needs no
 * special support, it is just three links to one body. With a non-empty default the app stops
 * at the first, and the other two sit unused; that is the intended shape of a default (unlike a
 * scenario stub, a default is allowed to go unclaimed).
 */
const agencyListUrls = [
  `/gtfs_agencies/list?date_from=${utcDayBeforeClock(1)}`,
  `/gtfs_agencies/list?date_from=${utcDayBeforeClock(7)}`,
  '/gtfs_agencies/list?date_from=2025-05-18',
]

/** Real operator refs and names, verified against the live stride API for FIXTURE_DATE. Covers
 *  MAJOR_OPERATORS (src/model/operator.ts), the train, and the operators the vehicle scenario
 *  uses, so an operator dropdown built from this renders real choices. */
export const DEFAULT_AGENCIES = [
  gtfsAgency({ operatorRef: 2, agencyName: 'רכבת ישראל' }),
  gtfsAgency({ operatorRef: 3, agencyName: 'אגד' }),
  gtfsAgency({ operatorRef: 5, agencyName: 'דן' }),
  gtfsAgency({ operatorRef: 15, agencyName: 'מטרופולין' }),
  gtfsAgency({ operatorRef: 18, agencyName: 'קווים' }),
  gtfsAgency({ operatorRef: 25, agencyName: 'אלקטרה אפיקים' }),
  gtfsAgency({ operatorRef: 34, agencyName: 'תנופה' }),
  gtfsAgency({ operatorRef: 97, agencyName: 'אודליה מוניות בעמ' }),
]

export const strideDefaults = (): StrideStub[] =>
  agencyListUrls.map((url) => okStub(url, gtfsAgenciesWire(DEFAULT_AGENCIES)))
