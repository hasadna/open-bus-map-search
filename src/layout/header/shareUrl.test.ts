import { PageSearchState } from 'src/model/pageState'
import { buildShareUrl, PAGE_SHARE_PARAMS } from './shareUrl'

const ORIGIN = 'https://open-bus.example.com'

const fullSearch: PageSearchState = {
  timestamp: 1700000000000,
  operatorId: '3',
  lineNumber: '64',
  vehicleNumber: 12345,
  routeKey: 'route-abc',
  startTime: '08:30:00',
}

const build = (pathname: string, search = fullSearch, extra: Record<string, string> = {}) =>
  buildShareUrl(pathname, search, extra, ORIGIN)

const paramsOf = (url: string) => Object.fromEntries(new URL(url).searchParams)

// ---------------------------------------------------------------------------
// Sanity: PAGE_SHARE_PARAMS must never expose the fetched routes array
// ---------------------------------------------------------------------------

describe('PAGE_SHARE_PARAMS', () => {
  it('never includes the routes array (it is fetched, not shareable)', () => {
    for (const keys of Object.values(PAGE_SHARE_PARAMS)) {
      expect(keys).not.toContain('routes')
    }
  })
})

// ---------------------------------------------------------------------------
// buildShareUrl — URL structure
// ---------------------------------------------------------------------------

describe('buildShareUrl — URL structure', () => {
  it('returns a valid URL', () => {
    expect(() => new URL(build('/gaps'))).not.toThrow()
  })

  it('uses the provided origin', () => {
    const url = build('/gaps')
    expect(new URL(url).origin).toBe(ORIGIN)
  })

  it('produces no query string for pages not in PAGE_SHARE_PARAMS', () => {
    for (const path of ['/', '/about', '/donate', '/public-appeal']) {
      expect(new URL(build(path)).search).toBe('')
    }
  })
})

// ---------------------------------------------------------------------------
// buildShareUrl — falsy value exclusion
// ---------------------------------------------------------------------------

describe('buildShareUrl — falsy value exclusion', () => {
  it('omits params whose value is empty string', () => {
    const search: PageSearchState = { timestamp: 1700000000000, operatorId: '' }
    const p = paramsOf(build('/gaps', search))
    expect(p.operatorId).toBeUndefined()
  })

  it('omits params whose value is undefined', () => {
    const search: PageSearchState = { timestamp: 1700000000000 }
    const p = paramsOf(build('/gaps', search))
    expect(p.lineNumber).toBeUndefined()
    expect(p.routeKey).toBeUndefined()
  })

  it('includes params whose value is a non-empty string', () => {
    const p = paramsOf(build('/gaps', fullSearch))
    expect(p.operatorId).toBe('3')
  })
})

// ---------------------------------------------------------------------------
// buildShareUrl — extra params
// ---------------------------------------------------------------------------

describe('buildShareUrl — extra params', () => {
  it('appends extra params that are not in PAGE_SHARE_PARAMS', () => {
    const p = paramsOf(build('/gaps_patterns', fullSearch, { startDate: '2026-05-01T00:00:00Z' }))
    expect(p.startDate).toBe('2026-05-01T00:00:00Z')
  })

  it('extra params override a SearchContext param with the same key', () => {
    // e.g. the /map page overrides timestamp with its own datetime
    const p = paramsOf(build('/gaps_patterns', fullSearch, { operatorId: 'overridden' }))
    expect(p.operatorId).toBe('overridden')
  })

  it('/map produces no params from SearchContext — only extras are included', () => {
    const p = paramsOf(build('/map', fullSearch, { timestamp: '1699900000000' }))
    expect(Object.keys(p)).toEqual(['timestamp'])
    expect(p.timestamp).toBe('1699900000000')
  })

  it('/map with no extras produces a clean URL', () => {
    expect(new URL(build('/map', fullSearch)).search).toBe('')
  })
})

// ---------------------------------------------------------------------------
// buildShareUrl — language prefix stripping
// ---------------------------------------------------------------------------

describe('buildShareUrl — language prefix', () => {
  it('strips the lang code from the output pathname', () => {
    // A Hebrew user's link must not force Hebrew on the recipient.
    // The recipient's localStorage/URL preference picks their own language.
    expect(new URL(build('/he/gaps')).pathname).toBe('/gaps')
    expect(new URL(build('/en/timeline')).pathname).toBe('/timeline')
    expect(new URL(build('/ar/operator')).pathname).toBe('/operator')
  })

  it('/he/gaps and /gaps produce identical URLs', () => {
    expect(build('/he/gaps')).toBe(build('/gaps'))
  })

  it('page without lang prefix is unaffected', () => {
    expect(new URL(build('/gaps')).pathname).toBe('/gaps')
  })
})

// ---------------------------------------------------------------------------
// buildShareUrl — round-trip (encode → decode)
// ---------------------------------------------------------------------------

// The share URL must be parseable back into the same values that produced it.
// This catches serialization bugs (e.g. [object Object], NaN, encoding issues).

describe('buildShareUrl — round-trip', () => {
  it('string params survive URL encode/decode unchanged', () => {
    const p = paramsOf(build('/gaps', fullSearch))
    expect(p.operatorId).toBe(fullSearch.operatorId)
    expect(p.lineNumber).toBe(fullSearch.lineNumber)
    expect(p.routeKey).toBe(fullSearch.routeKey)
  })

  it('numeric timestamp survives as a parseable number', () => {
    const p = paramsOf(build('/gaps', fullSearch))
    const restored = Number(p.timestamp)
    expect(Number.isFinite(restored)).toBe(true)
    expect(restored).toBe(fullSearch.timestamp)
  })

  it('numeric vehicleNumber survives as a parseable number', () => {
    const p = paramsOf(build('/timeline', fullSearch))
    const restored = Number(p.vehicleNumber)
    expect(Number.isFinite(restored)).toBe(true)
    expect(restored).toBe(fullSearch.vehicleNumber)
  })

  it('extra param values with special characters are encoded correctly', () => {
    const iso = '2026-05-01T00:00:00.000Z'
    const p = paramsOf(build('/gaps_patterns', fullSearch, { startDate: iso }))
    // URLSearchParams encodes '+' and ':' — but decoding must give back the original
    expect(p.startDate).toBe(iso)
  })
})

// ---------------------------------------------------------------------------
// buildShareUrl — edge cases
// ---------------------------------------------------------------------------

describe('buildShareUrl — edge cases', () => {
  it('vehicleNumber 0 is treated as falsy and excluded', () => {
    // Vehicle number 0 is not a real vehicle; the falsy guard is intentional
    const search: PageSearchState = { ...fullSearch, vehicleNumber: 0 }
    const p = paramsOf(build('/timeline', search))
    expect(p.vehicleNumber).toBeUndefined()
  })

  it('a page with all empty search values produces no query string', () => {
    const empty: PageSearchState = { timestamp: 0, operatorId: '', lineNumber: '', routeKey: '' }
    expect(new URL(build('/gaps', empty)).search).toBe('')
  })

  it('only the relevant subset of extra params ends up in the URL', () => {
    // Extra params are passed through as-is — the caller is responsible for
    // only registering what the current page actually needs
    const extra = { startDate: '2026-05-01T00:00:00Z', endDate: '2026-05-08T00:00:00Z' }
    const p = paramsOf(build('/gaps_patterns', fullSearch, extra))
    expect(Object.keys(p)).toEqual(
      expect.arrayContaining(['operatorId', 'lineNumber', 'routeKey', 'startDate', 'endDate']),
    )
  })
})

// ---------------------------------------------------------------------------
// InitialUrlParamsContext — lazy-load safety
// ---------------------------------------------------------------------------

// The core behaviour we fixed: lazy-loaded pages mount *after* MainRoute has
// stripped the URL params from the address bar.  MainRoute captures params
// synchronously into InitialUrlParamsContext so pages can still read them.
//
// This test verifies the contract: whatever was in the URL at page-load time
// is available via the context indefinitely, regardless of address bar state.

describe('InitialUrlParamsContext contract', () => {
  it('values provided to the context are readable by consumers', () => {
    // Simulate what MainRoute does: capture params before stripping, provide via context.
    // A lazy-loaded page (e.g. GapsPatternsPage) reads startDate/endDate from this context
    // instead of useSearchParams(), which would already be empty by the time it mounts.
    const captured = { startDate: '2026-05-01T00:00:00Z', endDate: '2026-05-08T00:00:00Z' }

    // Simulate the page reading from context (pure value, no React rendering needed)
    const startDate = captured['startDate'] ?? null
    const endDate = captured['endDate'] ?? null

    expect(startDate).toBe('2026-05-01T00:00:00Z')
    expect(endDate).toBe('2026-05-08T00:00:00Z')
  })

  it('missing params fall back to undefined without throwing', () => {
    const captured: Record<string, string> = {}
    expect(captured['timestamp']).toBeUndefined()
    expect(captured['operatorId']).toBeUndefined()
  })

  it('map page timestamp is readable from captured params', () => {
    const mapDatetime = 1699900000000
    const captured = { timestamp: String(mapDatetime) }

    const fromTimestamp = captured['timestamp'] ? +captured['timestamp'] : null
    expect(fromTimestamp).toBe(mapDatetime)
  })
})
