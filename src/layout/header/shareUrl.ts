import { getPathWithoutLang } from 'src/locale/allTranslations'
import { GlobalSearchState } from 'src/model/globalState'
import { PAGE_GLOBAL_SHARE_KEYS } from 'src/model/pageState'

export type { GlobalSearchState }

/**
 * Build a shareable URL for the current page.
 *
 * The URL contains two groups of params:
 *   1. Global fields relevant to this page (from PAGE_GLOBAL_SHARE_KEYS).
 *   2. Page-specific params registered via usePageState → PageShareParamsContext
 *      (e.g. gaps_patterns' startDate/endDate, velocity-heatmap's visMode/center/zoom).
 *
 * Scroll position, map viewport on auto-fit pages, and other purely local UI
 * state are never included — they are device-specific and useless to a recipient.
 */
export const buildShareUrl = (
  pathname: string,
  search: GlobalSearchState,
  pageParams: Record<string, string>,
  origin = window.location.origin,
): string => {
  const pagePath = getPathWithoutLang(pathname)
  // For dynamic paths like /profile/123, fall back to the base path /profile
  const basePath = pagePath.replace(/\/[^/]+$/, '') || '/'
  const relevantKeys = PAGE_GLOBAL_SHARE_KEYS[pagePath] ?? PAGE_GLOBAL_SHARE_KEYS[basePath] ?? []

  const params = new URLSearchParams()

  for (const key of relevantKeys) {
    const value = search[key]
    // Falsy values (null, 0, '') are treated as "not set" and omitted.
    // vehicleNumber 0 is not a real vehicle; date 0 (epoch) is never a valid query date.
    if (value) {
      params.set(key, String(value))
    }
  }

  // Page-specific params come last and can override global ones with the same
  // key (e.g. /map registers its own 'date' with full datetime precision).
  Object.entries(pageParams).forEach(([key, value]) => params.set(key, value))

  const query = params.toString()
  // Use the lang-stripped path so shared links are language-agnostic.
  // The recipient's language preference (localStorage) picks their own lang.
  return `${origin}${pagePath}${query ? `?${query}` : ''}`
}
