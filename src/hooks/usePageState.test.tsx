import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { ExtraShareParamsContext, InitialUrlParamsContext } from 'src/model/routeContext'
import { usePageState } from './usePageState'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWrapper(initialUrlParams: Record<string, string> = {}, setShareParams = jest.fn()) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <InitialUrlParamsContext.Provider value={initialUrlParams}>
      <ExtraShareParamsContext.Provider value={{ params: {}, setParams: setShareParams }}>
        {children}
      </ExtraShareParamsContext.Provider>
    </InitialUrlParamsContext.Provider>
  )
  return { Wrapper, setShareParams }
}

// The timeline page is the real consumer: a single shareable string param
// (time-of-day) plus session-only scroll position.
const DEFAULTS = {
  params: { time: '08:30' },
  ui: { scrollPosition: 0 },
}

beforeEach(() => {
  sessionStorage.clear()
})

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

describe('usePageState — defaults', () => {
  it('returns default params when nothing is stored', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    expect(result.current.params).toEqual(DEFAULTS.params)
  })

  it('returns default ui when nothing is stored', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    expect(result.current.ui).toEqual(DEFAULTS.ui)
  })
})

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

describe('usePageState — sessionStorage persistence', () => {
  it('stores params under page:<key>:params after a mutation', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePageState('my-page', DEFAULTS), { wrapper: Wrapper })
    act(() => {
      result.current.setParams((prev) => ({ ...prev, time: '09:15' }))
    })
    const stored = JSON.parse(sessionStorage.getItem('page:my-page:params')!)
    expect(stored.time).toBe('09:15')
  })

  it('stores ui under page:<key>:ui after a mutation', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePageState('my-page', DEFAULTS), { wrapper: Wrapper })
    act(() => {
      result.current.setUi((prev) => ({ ...prev, scrollPosition: 240 }))
    })
    const stored = JSON.parse(sessionStorage.getItem('page:my-page:ui')!)
    expect(stored.scrollPosition).toBe(240)
  })

  it('setParams updates params', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    act(() => {
      result.current.setParams((prev) => ({ ...prev, time: '09:15' }))
    })
    expect(result.current.params.time).toBe('09:15')
  })

  it('setUi updates ui', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    act(() => {
      result.current.setUi((prev) => ({ ...prev, scrollPosition: 240 }))
    })
    expect(result.current.ui.scrollPosition).toBe(240)
  })

  it('different storage keys do not interfere with each other', () => {
    const { Wrapper } = makeWrapper()
    const { result: r1 } = renderHook(() => usePageState('page-a', DEFAULTS), {
      wrapper: Wrapper,
    })
    const { result: r2 } = renderHook(
      () => usePageState('page-b', { params: { time: '12:00' }, ui: { scrollPosition: 0 } }),
      { wrapper: Wrapper },
    )
    act(() => {
      r1.current.setParams((prev) => ({ ...prev, time: '09:15' }))
    })
    expect(r2.current.params.time).toBe('12:00') // page-b default unchanged
    expect(r1.current.params.time).toBe('09:15')
  })
})

// ---------------------------------------------------------------------------
// URL param seeding — type coercion
//
// time is a string, so number/boolean coercion is exercised with small
// purpose-built fixtures (the hook is generic and other pages will use them).
// ---------------------------------------------------------------------------

describe('usePageState — URL param seeding', () => {
  it('seeds a string param from the namespaced URL key', () => {
    const { Wrapper } = makeWrapper({ 'test.time': '07:45' })
    const { result } = renderHook(() => usePageState('test', DEFAULTS), {
      wrapper: Wrapper,
    })
    expect(result.current.params.time).toBe('07:45')
  })

  it('coerces a numeric URL param to number', () => {
    const numericDefaults = { params: { count: 0 }, ui: { scrollPosition: 0 } }
    const { Wrapper } = makeWrapper({ 'test.count': '42' })
    const { result } = renderHook(() => usePageState('test', numericDefaults), {
      wrapper: Wrapper,
    })
    expect(result.current.params.count).toBe(42)
  })

  it('coerces a boolean URL param: "true" → true', () => {
    const boolDefaults = { params: { active: false }, ui: { scrollPosition: 0 } }
    const { Wrapper } = makeWrapper({ 'test.active': 'true' })
    const { result } = renderHook(() => usePageState('test', boolDefaults), {
      wrapper: Wrapper,
    })
    expect(result.current.params.active).toBe(true)
  })

  it('coerces a boolean URL param: anything other than "true" → false', () => {
    const boolDefaults = { params: { active: true }, ui: { scrollPosition: 0 } }
    const { Wrapper } = makeWrapper({ 'test.active': 'false' })
    const { result } = renderHook(() => usePageState('test', boolDefaults), {
      wrapper: Wrapper,
    })
    expect(result.current.params.active).toBe(false)
  })

  it('falls back to default when URL number param is not finite', () => {
    const numericDefaults = { params: { count: 5 }, ui: { scrollPosition: 0 } }
    const { Wrapper } = makeWrapper({ 'test.count': 'not-a-number' })
    const { result } = renderHook(() => usePageState('test', numericDefaults), {
      wrapper: Wrapper,
    })
    expect(result.current.params.count).toBe(numericDefaults.params.count)
  })

  it('seeds every params key present in the URL', () => {
    const { Wrapper } = makeWrapper({ 'test.time': '07:45', 'test.operatorId': '3' })
    const defaults = { params: { time: '08:30', operatorId: '' }, ui: { scrollPosition: 0 } }
    const { result } = renderHook(() => usePageState('test', defaults), {
      wrapper: Wrapper,
    })
    expect(result.current.params.operatorId).toBe('3')
    expect(result.current.params.time).toBe('07:45')
  })

  it('ignores a bare (un-namespaced) URL key — e.g. a colliding global key', () => {
    // A page-local param named `date` must NOT be seeded from the global `date`
    // key. Only the namespaced `test.date` key seeds this page's param.
    const { Wrapper } = makeWrapper({ date: '2020-01-01' })
    const defaults = { params: { date: '2026-06-20' }, ui: { scrollPosition: 0 } }
    const { result } = renderHook(() => usePageState('test', defaults), {
      wrapper: Wrapper,
    })
    expect(result.current.params.date).toBe('2026-06-20') // default, not the global value
  })

  it('ignores another page’s namespaced key', () => {
    const { Wrapper } = makeWrapper({ 'other.time': '07:45' })
    const defaults = { params: { time: '08:30' }, ui: { scrollPosition: 0 } }
    const { result } = renderHook(() => usePageState('test', defaults), {
      wrapper: Wrapper,
    })
    expect(result.current.params.time).toBe('08:30') // unaffected by other.time
  })

  it('ignores URL params absent from the URL without error', () => {
    const { Wrapper } = makeWrapper({}) // no url params at all
    const defaults = { params: { time: '08:30', count: 5 }, ui: { scrollPosition: 0 } }
    const { result } = renderHook(() => usePageState('test', defaults), {
      wrapper: Wrapper,
    })
    expect(result.current.params.time).toBe(defaults.params.time)
    expect(result.current.params.count).toBe(defaults.params.count)
  })

  it('does not re-seed from the URL on a later remount (same session snapshot)', () => {
    // Reproduces the re-seed bug: open a shared link, edit the value, then
    // navigate away and back via the app menu. The page unmounts/remounts but
    // MainRoute (and its snapshot) does not, so the edit must survive.
    const snapshot = { 'test.time': '07:45' }
    const { Wrapper } = makeWrapper(snapshot)
    const first = renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    expect(first.result.current.params.time).toBe('07:45') // seeded from URL
    act(() => {
      first.result.current.setParams((prev) => ({ ...prev, time: '09:00' }))
    })
    first.unmount()
    // Remount sharing the SAME snapshot object (MainRoute did not remount).
    const second = renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    expect(second.result.current.params.time).toBe('09:00') // edit preserved, not re-clobbered
  })

  it('does not re-apply URL overrides on subsequent renders', () => {
    const numericDefaults = { params: { count: 1 }, ui: { scrollPosition: 0 } }
    const { Wrapper } = makeWrapper({ 'test.count': '99' })
    const { result } = renderHook(() => usePageState('test', numericDefaults), {
      wrapper: Wrapper,
    })
    expect(result.current.params.count).toBe(99)
    // manually change it back
    act(() => {
      result.current.setParams((prev) => ({ ...prev, count: 1 }))
    })
    // still 1, not re-seeded from URL
    expect(result.current.params.count).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// ExtraShareParamsContext sync
// ---------------------------------------------------------------------------

describe('usePageState — ExtraShareParamsContext sync', () => {
  it('registers namespaced serialized params into ExtraShareParamsContext on mount', () => {
    const setShareParams = jest.fn()
    const { Wrapper } = makeWrapper({}, setShareParams)
    renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    expect(setShareParams).toHaveBeenCalledWith(expect.objectContaining({ 'test.time': '08:30' }))
  })

  it('updates ExtraShareParamsContext when params change', () => {
    const setShareParams = jest.fn()
    const { Wrapper } = makeWrapper({}, setShareParams)
    const { result } = renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    setShareParams.mockClear()
    act(() => {
      result.current.setParams((prev) => ({ ...prev, time: '09:15' }))
    })
    expect(setShareParams).toHaveBeenCalledWith(expect.objectContaining({ 'test.time': '09:15' }))
  })

  it('omits null param values from the share context', () => {
    const setShareParams = jest.fn()
    const defaults = {
      params: { time: '08:30', note: null as string | null },
      ui: { scrollPosition: 0 },
    }
    const { Wrapper } = makeWrapper({}, setShareParams)
    renderHook(() => usePageState('nullable', defaults), { wrapper: Wrapper })
    const lastCall = setShareParams.mock.calls[setShareParams.mock.calls.length - 1][0]
    expect(lastCall['nullable.note']).toBeUndefined()
    expect(lastCall['nullable.time']).toBe('08:30')
  })

  it('clears ExtraShareParamsContext on unmount', () => {
    const setShareParams = jest.fn()
    const { Wrapper } = makeWrapper({}, setShareParams)
    const { unmount } = renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    setShareParams.mockClear()
    unmount()
    expect(setShareParams).toHaveBeenCalledWith({})
  })
})
