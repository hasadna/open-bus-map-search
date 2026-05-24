import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { InitialUrlParamsContext, PageShareParamsContext } from 'src/model/pageState'
import { usePageState } from './usePageState'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWrapper(initialUrlParams: Record<string, string> = {}, setShareParams = jest.fn()) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <InitialUrlParamsContext.Provider value={initialUrlParams}>
      <PageShareParamsContext.Provider value={{ params: {}, setParams: setShareParams }}>
        {children}
      </PageShareParamsContext.Provider>
    </InitialUrlParamsContext.Provider>
  )
  return { Wrapper, setShareParams }
}

const DEFAULTS = {
  params: { mode: 'avg' as 'avg' | 'std', count: 5, active: true, label: 'hello' },
  ui: { scrollPosition: 0, isExpanded: false },
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
      result.current.setParams((prev) => ({ ...prev, mode: 'std' }))
    })
    const stored = JSON.parse(sessionStorage.getItem('page:my-page:params')!)
    expect(stored.mode).toBe('std')
  })

  it('stores ui under page:<key>:ui after a mutation', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePageState('my-page', DEFAULTS), { wrapper: Wrapper })
    act(() => {
      result.current.setUi((prev) => ({ ...prev, isExpanded: true }))
    })
    const stored = JSON.parse(sessionStorage.getItem('page:my-page:ui')!)
    expect(stored.isExpanded).toBe(true)
  })

  it('setParams updates params', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    act(() => {
      result.current.setParams((prev) => ({ ...prev, mode: 'std' }))
    })
    expect(result.current.params.mode).toBe('std')
  })

  it('setUi updates ui', () => {
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    act(() => {
      result.current.setUi((prev) => ({ ...prev, isExpanded: true }))
    })
    expect(result.current.ui.isExpanded).toBe(true)
  })

  it('different storage keys do not interfere with each other', () => {
    const { Wrapper } = makeWrapper()
    const { result: r1 } = renderHook(() => usePageState('page-a', DEFAULTS), {
      wrapper: Wrapper,
    })
    const { result: r2 } = renderHook(
      () =>
        usePageState('page-b', {
          params: { mode: 'std' as const, count: 5, active: true, label: 'hello' },
          ui: { scrollPosition: 0, isExpanded: false },
        }),
      { wrapper: Wrapper },
    )
    act(() => {
      r1.current.setParams((prev) => ({ ...prev, mode: 'std' }))
    })
    expect(r2.current.params.mode).toBe('std') // page-b default unchanged
    expect(r1.current.params.mode).toBe('std')
  })
})

// ---------------------------------------------------------------------------
// URL param seeding — type coercion
// ---------------------------------------------------------------------------

describe('usePageState — URL param seeding', () => {
  it('seeds a string param from the URL', () => {
    const { Wrapper } = makeWrapper({ label: 'from-url' })
    const { result } = renderHook(() => usePageState('test', DEFAULTS, ['label']), {
      wrapper: Wrapper,
    })
    expect(result.current.params.label).toBe('from-url')
  })

  it('coerces a numeric URL param to number', () => {
    const { Wrapper } = makeWrapper({ count: '42' })
    const { result } = renderHook(() => usePageState('test', DEFAULTS, ['count']), {
      wrapper: Wrapper,
    })
    expect(result.current.params.count).toBe(42)
  })

  it('coerces a boolean URL param: "true" → true', () => {
    const { Wrapper } = makeWrapper({ active: 'true' })
    const { result } = renderHook(() => usePageState('test', DEFAULTS, ['active']), {
      wrapper: Wrapper,
    })
    expect(result.current.params.active).toBe(true)
  })

  it('coerces a boolean URL param: anything other than "true" → false', () => {
    const { Wrapper } = makeWrapper({ active: 'false' })
    const { result } = renderHook(() => usePageState('test', DEFAULTS, ['active']), {
      wrapper: Wrapper,
    })
    expect(result.current.params.active).toBe(false)
  })

  it('falls back to default when URL number param is not finite', () => {
    const { Wrapper } = makeWrapper({ count: 'not-a-number' })
    const { result } = renderHook(() => usePageState('test', DEFAULTS, ['count']), {
      wrapper: Wrapper,
    })
    expect(result.current.params.count).toBe(DEFAULTS.params.count)
  })

  it('does not apply a URL param that is not listed in urlParamKeys', () => {
    const { Wrapper } = makeWrapper({ mode: 'std', label: 'from-url' })
    // only 'label' is listed — 'mode' should be ignored
    const { result } = renderHook(() => usePageState('test', DEFAULTS, ['label']), {
      wrapper: Wrapper,
    })
    expect(result.current.params.mode).toBe(DEFAULTS.params.mode)
    expect(result.current.params.label).toBe('from-url')
  })

  it('ignores URL params absent from the URL without error', () => {
    const { Wrapper } = makeWrapper({}) // no url params at all
    const { result } = renderHook(() => usePageState('test', DEFAULTS, ['label', 'count']), {
      wrapper: Wrapper,
    })
    expect(result.current.params.label).toBe(DEFAULTS.params.label)
    expect(result.current.params.count).toBe(DEFAULTS.params.count)
  })

  it('does not re-apply URL overrides on subsequent renders', () => {
    const { Wrapper } = makeWrapper({ count: '99' })
    const { result } = renderHook(() => usePageState('test', DEFAULTS, ['count']), {
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
// PageShareParamsContext sync
// ---------------------------------------------------------------------------

describe('usePageState — PageShareParamsContext sync', () => {
  it('registers serialized params into PageShareParamsContext on mount', () => {
    const setShareParams = jest.fn()
    const { Wrapper } = makeWrapper({}, setShareParams)
    renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    expect(setShareParams).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'avg', count: '5', active: 'true', label: 'hello' }),
    )
  })

  it('updates PageShareParamsContext when params change', () => {
    const setShareParams = jest.fn()
    const { Wrapper } = makeWrapper({}, setShareParams)
    const { result } = renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    setShareParams.mockClear()
    act(() => {
      result.current.setParams((prev) => ({ ...prev, count: 99 }))
    })
    expect(setShareParams).toHaveBeenCalledWith(expect.objectContaining({ count: '99' }))
  })

  it('omits null param values from the share context', () => {
    const setShareParams = jest.fn()
    const defaults = {
      params: { label: null as string | null, count: 5 },
      ui: { scrollPosition: 0 },
    }
    const { Wrapper } = makeWrapper({}, setShareParams)
    renderHook(() => usePageState('nullable', defaults), { wrapper: Wrapper })
    const lastCall = setShareParams.mock.calls[setShareParams.mock.calls.length - 1][0]
    expect(lastCall.label).toBeUndefined()
    expect(lastCall.count).toBe('5')
  })

  it('clears PageShareParamsContext on unmount', () => {
    const setShareParams = jest.fn()
    const { Wrapper } = makeWrapper({}, setShareParams)
    const { unmount } = renderHook(() => usePageState('test', DEFAULTS), { wrapper: Wrapper })
    setShareParams.mockClear()
    unmount()
    expect(setShareParams).toHaveBeenCalledWith({})
  })
})
