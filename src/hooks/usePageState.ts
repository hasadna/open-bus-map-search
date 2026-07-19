import { debounce } from 'es-toolkit/compat'
import { useContext, useEffect, useMemo, useRef } from 'react'
import { useSessionStorage } from 'usehooks-ts'
import { InitialUrlParamsContext, PageShareParamsContext } from 'src/model/routeContext'

type Serializable = string | number | boolean | null

/** Converts page params to a flat string record for URL serialization.
 *  Keys are namespaced as `<storageKey>.<param>` so a page-local param can
 *  never collide with a global search key (e.g. an isolated `date`).
 *  null and undefined values are omitted (no param = not set). */
function serializeParams(
  params: Record<string, Serializable>,
  storageKey: string,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      result[`${storageKey}.${key}`] = String(value)
    }
  }
  return result
}

/**
 * Per-page state with a params/ui split.
 *
 * params — shareable: included in the share URL via PageShareParamsContext,
 *          namespaced as `<storageKey>.<param>` so they never collide with the
 *          global search keys or another page's params.
 *          Restored from URL params on first load (for incoming shared links).
 *          Stored in sessionStorage['page:<key>:params'].
 *
 * ui     — session-only: never in the share URL. Scroll position, map
 *          viewport, panel expansion state. Device-specific; meaningless
 *          to share. Stored in sessionStorage['page:<key>:ui'].
 *
 * @param storageKey  Short page identifier, e.g. 'gaps-patterns'.
 * @param defaults    Default { params, ui } — used when nothing is in storage.
 *                    Every params key is shareable (out via PageShareParamsContext)
 *                    and seedable from the URL on first load, with type coercion
 *                    based on the default value's type.
 */
export function usePageState<
  TParams extends Record<string, Serializable>,
  TUi extends Record<string, unknown>,
>(storageKey: string, defaults: { params: TParams; ui: TUi }) {
  const [params, setParams] = useSessionStorage(`page:${storageKey}:params`, defaults.params)
  const [ui, setUi] = useSessionStorage(`page:${storageKey}:ui`, defaults.ui)

  const initialUrlParams = useContext(InitialUrlParamsContext)
  const { setParams: setShareParams } = useContext(PageShareParamsContext)

  /*
    On first mount, apply any URL params that match the page's params keys.
    Then delete those keys from the initialUrlParams so a later remount (app menu navigation - sharing this snapshot) won't re-seed.
  */
  const appliedUrlOverrides = useRef(false)
  useEffect(() => {
    if (appliedUrlOverrides.current) return
    appliedUrlOverrides.current = true

    const overrides: Partial<TParams> = {}
    for (const key of Object.keys(defaults.params) as (keyof TParams)[]) {
      const urlKey = `${storageKey}.${String(key)}`
      const raw = initialUrlParams[urlKey]
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
      // Consume the key so a later remount (sharing this snapshot) won't re-seed.
      delete initialUrlParams[urlKey]
    }

    if (Object.keys(overrides).length > 0) {
      setParams((prev) => ({ ...prev, ...overrides }))
    }
  }, [])

  // Keep PageShareParamsContext in sync with current params so the share
  // button always produces a URL that restores this page's exact view.
  const serialized = useMemo(
    () => serializeParams(params as Record<string, Serializable>, storageKey),
    [params, storageKey],
  )
  useEffect(() => {
    setShareParams(serialized)
    return () => setShareParams({})
  }, [serialized, setShareParams])

  // Scroll save + restore.
  // The scroll container is #main-content (overflow:auto), not window —
  // the outer layout has overflow:hidden so window.scrollY is always 0.
  useEffect(() => {
    const container = document.getElementById('main-content')
    if (!container) return

    const saved = (ui as Record<string, unknown>).scrollPosition
    if (typeof saved === 'number' && saved > 0) {
      requestAnimationFrame(() => container.scrollTo(0, saved))
    }

    const saveScroll = debounce(() => {
      setUi((prev) => ({ ...prev, scrollPosition: container.scrollTop }))
    }, 300)

    container.addEventListener('scroll', saveScroll)
    return () => {
      saveScroll.cancel()
      container.removeEventListener('scroll', saveScroll)
    }
  }, [])

  return { params, ui, setParams, setUi }
}
