import { useContext, useEffect, useMemo, useRef } from 'react'
import { useSessionStorage } from 'usehooks-ts'
import { PageShareParamsContext, InitialUrlParamsContext } from 'src/model/pageState'

type Serializable = string | number | boolean | null

/** Converts page params to a flat string record for URL serialization.
 *  null and undefined values are omitted (no param = not set). */
function serializeParams(params: Record<string, Serializable>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      result[key] = String(value)
    }
  }
  return result
}

/**
 * Per-page state with a params/ui split.
 *
 * params — shareable: included in the share URL via PageShareParamsContext.
 *          Restored from URL params on first load (for incoming shared links).
 *          Stored in sessionStorage['page:<key>:params'].
 *
 * ui     — session-only: never in the share URL. Scroll position, map
 *          viewport, panel expansion state. Device-specific; meaningless
 *          to share. Stored in sessionStorage['page:<key>:ui'].
 *
 * @param storageKey  Short page identifier, e.g. 'gaps-patterns'.
 * @param defaults    Default { params, ui } — used when nothing is in storage.
 * @param urlParamKeys  Keys of params that can be seeded from the URL on first
 *                    load. The hook reads these from InitialUrlParamsContext and
 *                    applies type coercion based on the default value's type.
 */
export function usePageState<
  TParams extends Record<string, Serializable>,
  TUi extends Record<string, unknown>,
>(
  storageKey: string,
  defaults: { params: TParams; ui: TUi },
  urlParamKeys: (keyof TParams)[] = [],
) {
  const [params, setParams] = useSessionStorage(`page:${storageKey}:params`, defaults.params)
  const [ui, setUi] = useSessionStorage(`page:${storageKey}:ui`, defaults.ui)

  const initialUrlParams = useContext(InitialUrlParamsContext)
  const { setParams: setShareParams } = useContext(PageShareParamsContext)

  // Apply URL param overrides exactly once on mount.
  // This lets shared links restore page-specific state (e.g. gaps_patterns
  // date range, velocity-heatmap visMode) even though these aren't in the
  // global SearchContext.
  const appliedUrlOverrides = useRef(false)
  useEffect(() => {
    if (appliedUrlOverrides.current || urlParamKeys.length === 0) return
    appliedUrlOverrides.current = true

    const overrides: Partial<TParams> = {}
    for (const key of urlParamKeys) {
      const raw = initialUrlParams[key as string]
      if (raw === undefined) continue

      const defaultVal = defaults.params[key]
      let coerced: Serializable

      if (typeof defaultVal === 'number') {
        const n = Number(raw)
        coerced = Number.isFinite(n) ? n : defaultVal
      } else if (typeof defaultVal === 'boolean') {
        coerced = raw === 'true'
      } else {
        coerced = raw
      }

      ;(overrides as Record<string, Serializable>)[key as string] = coerced
    }

    if (Object.keys(overrides).length > 0) {
      setParams((prev) => ({ ...prev, ...overrides }))
    }
  }, [])

  // Keep PageShareParamsContext in sync with current params so the share
  // button always produces a URL that restores this page's exact view.
  const serialized = useMemo(
    () => serializeParams(params as Record<string, Serializable>),
    [params],
  )
  useEffect(() => {
    setShareParams(serialized)
    return () => setShareParams({})
  }, [serialized, setShareParams])

  return { params, ui, setParams, setUi }
}
