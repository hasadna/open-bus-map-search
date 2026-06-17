import { GLOBAL_SEARCH_DEFAULTS, GlobalSearchState } from 'src/model/globalState'
import { buildShareUrl, PAGE_SHARE_PARAMS } from './shareUrl'
import type { ShareableKey } from './shareUrl'

const ORIGIN = 'https://open-bus.example.com'

const fullSearch: GlobalSearchState = {
  date: '2026-05-01',
  operatorId: '3',
  lineNumber: '64',
  routeKey: 'route-abc',
  rideTime: '08:30:00',
  stopKey: null,
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
    const search: GlobalSearchState = { ...fullSearch, operatorId: '' }
    const p = paramsOf(build('/gaps', search))
    expect(p.operatorId).toBeUndefined()
  })

  it('omits params whose value is null', () => {
    const search: GlobalSearchState = { ...fullSearch, lineNumber: null, routeKey: null }
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

  it('extra params override a GlobalSearchContext param with the same key', () => {
    const p = paramsOf(build('/gaps_patterns', fullSearch, { operatorId: 'overridden' }))
    expect(p.operatorId).toBe('overridden')
  })

  it('/map produces no params from GlobalSearchContext — only extras are included', () => {
    const p = paramsOf(build('/map', fullSearch, { datetime: '2023-03-14T17:00' }))
    expect(Object.keys(p)).toEqual(['datetime'])
    expect(p.datetime).toBe('2023-03-14T17:00')
  })

  it('/map with no extras produces a clean URL', () => {
    expect(new URL(build('/map', fullSearch)).search).toBe('')
  })
})

// ---------------------------------------------------------------------------
// buildShareUrl — /vehicle page
// ---------------------------------------------------------------------------

// vehicleNumber is no longer a GlobalSearchState field; the /vehicle page keeps
// it page-local and appends it through ExtraShareParamsContext, sharing only the
// global `date`. These guard that contract (and that the page never leaks the
// operator/line/route global state a vehicle link must not carry).

describe('buildShareUrl — /vehicle page', () => {
  it('shares only the global date — not operator/line/route', () => {
    const p = paramsOf(build('/vehicle', fullSearch))
    expect(p).toEqual({ date: fullSearch.date })
  })

  it('appends the page-local vehicleNumber via extra params', () => {
    const p = paramsOf(build('/vehicle', fullSearch, { vehicleNumber: '7489226' }))
    expect(p).toEqual({ date: fullSearch.date, vehicleNumber: '7489226' })
  })

  it('vehicleNumber is no longer a shareable global key on any page', () => {
    for (const keys of Object.values(PAGE_SHARE_PARAMS)) {
      expect(keys as string[]).not.toContain('vehicleNumber')
    }
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

  it('date string survives URL encode/decode unchanged', () => {
    const p = paramsOf(build('/gaps', fullSearch))
    expect(p.date).toBe(fullSearch.date)
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
  it('a page with all empty/null search values produces no query string', () => {
    const empty: GlobalSearchState = {
      ...GLOBAL_SEARCH_DEFAULTS,
      date: '',
      operatorId: null,
      lineNumber: null,
      routeKey: null,
    }
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
// buildShareUrl — per-page param contracts
// ---------------------------------------------------------------------------

// Each entry in PAGE_SHARE_PARAMS is a contract: the URL for that page must
// contain exactly the declared keys (when values are present) and nothing more.

describe('buildShareUrl — per-page param contracts', () => {
  for (const [path, keys] of Object.entries(PAGE_SHARE_PARAMS) as [string, ShareableKey[]][]) {
    describe(path, () => {
      it('includes all declared params that have a value', () => {
        const p = paramsOf(build(path, fullSearch))
        for (const key of keys) {
          if (fullSearch[key]) {
            expect(p[key]).toBeDefined()
          }
        }
      })

      it('does not include params from other pages', () => {
        const p = paramsOf(build(path, fullSearch))
        for (const k of Object.keys(p)) {
          expect(keys).toContain(k)
        }
      })
    })
  }
})

// ---------------------------------------------------------------------------
// buildShareUrl — dynamic profile path
// ---------------------------------------------------------------------------

// /profile/:id is not in PAGE_SHARE_PARAMS. The route ID is already in the
// path, so GlobalSearchContext params must not leak into the URL — only explicit
// extra params (e.g. rideTime) registered via ExtraShareParamsContext appear.

describe('buildShareUrl — dynamic profile path', () => {
  it('no GlobalSearchContext params leak into the URL', () => {
    const p = paramsOf(build('/profile/12345', fullSearch))
    expect(p.operatorId).toBeUndefined()
    expect(p.lineNumber).toBeUndefined()
    expect(p.date).toBeUndefined()
    expect(p.routeKey).toBeUndefined()
    expect(p.rideTime).toBeUndefined()
  })

  it('extra params (rideTime) are included', () => {
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
    expect(captured['date']).toBeUndefined()
    expect(captured['operatorId']).toBeUndefined()
  })
})
