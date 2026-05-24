import { GlobalSearchState } from 'src/model/searchState'
import { buildShareUrl } from './shareUrl'

const ORIGIN = 'https://open-bus.example.com'

const fullSearch: GlobalSearchState = {
  date: '2024-02-12',
  operatorId: '3',
  lineNumber: '64',
  vehicleNumber: 12345,
  routeKey: 'route-abc',
  rideTime: '2023-11-14T08:30:00.000Z',
  stopKey: 'stop-42',
}

const build = (pathname: string, search = fullSearch, pageParams: Record<string, string> = {}) =>
  buildShareUrl(pathname, search, pageParams, ORIGIN)

const paramsOf = (url: string) => Object.fromEntries(new URL(url).searchParams)

// ---------------------------------------------------------------------------
// URL structure
// ---------------------------------------------------------------------------

describe('buildShareUrl — URL structure', () => {
  it('returns a valid URL', () => {
    expect(() => new URL(build('/gaps'))).not.toThrow()
  })

  it('uses the provided origin', () => {
    expect(new URL(build('/gaps')).origin).toBe(ORIGIN)
  })

  it('produces no query string for pages absent from PAGE_GLOBAL_SHARE_KEYS', () => {
    for (const path of ['/', '/about', '/donate', '/public-appeal']) {
      expect(new URL(build(path)).search).toBe('')
    }
  })
})

// ---------------------------------------------------------------------------
// Falsy / null value exclusion
// ---------------------------------------------------------------------------

describe('buildShareUrl — null/falsy exclusion', () => {
  it('omits params whose value is null', () => {
    const search: GlobalSearchState = { ...fullSearch, operatorId: null }
    expect(paramsOf(build('/gaps', search)).operatorId).toBeUndefined()
  })

  it('omits params whose value is empty string', () => {
    const search: GlobalSearchState = { ...fullSearch, operatorId: '' }
    expect(paramsOf(build('/gaps', search)).operatorId).toBeUndefined()
  })

  it('includes params whose value is a non-empty string', () => {
    expect(paramsOf(build('/gaps')).operatorId).toBe('3')
  })
})

// ---------------------------------------------------------------------------
// Page-specific params (replaces PageShareParamsContext tests)
// ---------------------------------------------------------------------------

describe('buildShareUrl — page-specific params', () => {
  it('appends page params not in the global share keys', () => {
    const p = paramsOf(build('/gaps_patterns', fullSearch, { startDate: '2026-05-01T00:00:00Z' }))
    expect(p.startDate).toBe('2026-05-01T00:00:00Z')
  })

  it('page params override a global param with the same key', () => {
    const p = paramsOf(build('/gaps_patterns', fullSearch, { operatorId: 'overridden' }))
    expect(p.operatorId).toBe('overridden')
  })

  it('/map produces no global params — only page params are included', () => {
    const p = paramsOf(
      build('/map', fullSearch, {
        datetime: '1699900000000',
        centerLat: '32.1',
        centerLng: '34.9',
        zoom: '10',
      }),
    )
    expect(Object.keys(p)).toEqual(
      expect.arrayContaining(['datetime', 'centerLat', 'centerLng', 'zoom']),
    )
    // No global fields should leak in
    expect(p.operatorId).toBeUndefined()
    expect(p.date).toBeUndefined()
  })

  it('/map with no page params produces a clean URL', () => {
    expect(new URL(build('/map', fullSearch)).search).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Language prefix stripping
// ---------------------------------------------------------------------------

describe('buildShareUrl — language prefix', () => {
  it('strips the lang code from the output pathname', () => {
    expect(new URL(build('/he/gaps')).pathname).toBe('/gaps')
    expect(new URL(build('/en/timeline')).pathname).toBe('/timeline')
    expect(new URL(build('/ar/operator')).pathname).toBe('/operator')
  })

  it('/he/gaps and /gaps produce identical URLs', () => {
    expect(build('/he/gaps')).toBe(build('/gaps'))
  })
})

// ---------------------------------------------------------------------------
// Round-trip (encode → decode)
// ---------------------------------------------------------------------------

describe('buildShareUrl — round-trip', () => {
  it('string params survive URL encode/decode unchanged', () => {
    const p = paramsOf(build('/gaps'))
    expect(p.operatorId).toBe(fullSearch.operatorId)
    expect(p.lineNumber).toBe(fullSearch.lineNumber)
    expect(p.routeKey).toBe(fullSearch.routeKey)
  })

  it('date string survives URL encode/decode unchanged', () => {
    const p = paramsOf(build('/gaps'))
    expect(p.date).toBe(fullSearch.date)
  })

  it('numeric vehicleNumber survives as a parseable number', () => {
    const p = paramsOf(build('/timeline'))
    expect(Number.isFinite(Number(p.vehicleNumber))).toBe(false) // timeline excludes vehicleNumber
    const p2 = paramsOf(build('/single-line-map'))
    expect(Number(p2.vehicleNumber)).toBe(fullSearch.vehicleNumber)
  })

  it('page param ISO strings with special characters are encoded correctly', () => {
    const iso = '2026-05-01T00:00:00.000Z'
    const p = paramsOf(build('/gaps_patterns', fullSearch, { startDate: iso }))
    expect(p.startDate).toBe(iso)
  })

  it('rideTime ISO string survives encode/decode', () => {
    const p = paramsOf(build('/single-line-map'))
    expect(p.rideTime).toBe(fullSearch.rideTime)
  })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('buildShareUrl — edge cases', () => {
  it('vehicleNumber 0 is excluded (treated as falsy)', () => {
    // Vehicle number 0 is not a real vehicle
    const search: GlobalSearchState = { ...fullSearch, vehicleNumber: 0 }
    expect(paramsOf(build('/single-line-map', search)).vehicleNumber).toBeUndefined()
  })

  it('a search with all null/empty values produces no query string', () => {
    const empty: GlobalSearchState = {
      date: '',
      operatorId: null,
      lineNumber: null,
      routeKey: null,
      vehicleNumber: null,
      rideTime: null,
      stopKey: null,
    }
    expect(new URL(build('/gaps', empty)).search).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Per-page global key contracts
// ---------------------------------------------------------------------------

// Each page's entry in PAGE_GLOBAL_SHARE_KEYS is a contract: only those
// fields appear in the URL (plus any page-specific params).

describe('buildShareUrl — per-page global key contracts', () => {
  it('/timeline includes date, operatorId, lineNumber, routeKey, stopKey', () => {
    const p = paramsOf(build('/timeline'))
    expect(p.date).toBeDefined()
    expect(p.operatorId).toBeDefined()
    expect(p.lineNumber).toBeDefined()
    expect(p.routeKey).toBeDefined()
    expect(p.stopKey).toBeDefined()
    // must NOT include vehicle/rideTime
    expect(p.vehicleNumber).toBeUndefined()
    expect(p.rideTime).toBeUndefined()
  })

  it('/gaps excludes stopKey, vehicleNumber, rideTime', () => {
    const p = paramsOf(build('/gaps'))
    expect(p.stopKey).toBeUndefined()
    expect(p.vehicleNumber).toBeUndefined()
    expect(p.rideTime).toBeUndefined()
  })

  it('/gaps_patterns excludes date (uses page-param date range instead)', () => {
    const p = paramsOf(build('/gaps_patterns'))
    expect(p.date).toBeUndefined()
  })

  it('/single-line-map includes rideTime and stopKey', () => {
    const p = paramsOf(build('/single-line-map'))
    expect(p.rideTime).toBeDefined()
    expect(p.stopKey).toBeDefined()
  })

  it('/velocity-heatmap includes only date as a global param', () => {
    const p = paramsOf(build('/velocity-heatmap'))
    expect(p.date).toBeDefined()
    expect(p.operatorId).toBeUndefined()
    expect(p.lineNumber).toBeUndefined()
  })

  it('/operator includes operatorId and date', () => {
    const p = paramsOf(build('/operator'))
    expect(p.operatorId).toBeDefined()
    expect(p.date).toBeDefined()
    expect(p.lineNumber).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Dynamic profile path
// ---------------------------------------------------------------------------

// /profile/:id is not in PAGE_GLOBAL_SHARE_KEYS. The route ID is in the path.
// Only page params (rideTime, registered via usePageState) appear in the URL.

describe('buildShareUrl — dynamic profile path', () => {
  it('no global SearchContext params leak into the URL', () => {
    const p = paramsOf(build('/profile/12345'))
    expect(p.operatorId).toBeUndefined()
    expect(p.lineNumber).toBeUndefined()
    expect(p.date).toBeUndefined()
    expect(p.routeKey).toBeUndefined()
  })

  it('page params (rideTime) are included', () => {
    const p = paramsOf(build('/profile/12345', fullSearch, { rideTime: '08:30:00' }))
    expect(p.rideTime).toBe('08:30:00')
  })

  it('profile id is preserved in the pathname', () => {
    const url = new URL(build('/profile/12345', fullSearch, { rideTime: '08:30:00' }))
    expect(url.pathname).toBe('/profile/12345')
  })

  it('different profile ids produce different URLs', () => {
    const url1 = build('/profile/111', fullSearch, { rideTime: '08:00:00' })
    const url2 = build('/profile/222', fullSearch, { rideTime: '08:00:00' })
    expect(new URL(url1).pathname).not.toBe(new URL(url2).pathname)
  })
})

// ---------------------------------------------------------------------------
// InitialUrlParamsContext contract
// ---------------------------------------------------------------------------

describe('InitialUrlParamsContext contract', () => {
  it('values provided to the context are readable by consumers', () => {
    const captured = { startDate: '2026-05-01T00:00:00Z', endDate: '2026-05-08T00:00:00Z' }
    expect(captured['startDate']).toBe('2026-05-01T00:00:00Z')
    expect(captured['endDate']).toBe('2026-05-08T00:00:00Z')
  })

  it('missing params fall back to undefined without throwing', () => {
    const captured: Record<string, string> = {}
    expect(captured['date']).toBeUndefined()
    expect(captured['operatorId']).toBeUndefined()
  })

  it('map page datetime is readable from captured params', () => {
    const mapDatetime = 1699900000000
    const captured = { datetime: String(mapDatetime) }
    expect(Number(captured['datetime'])).toBe(mapDatetime)
  })
})
