import { useEffect } from 'react'
import { Navigate, useLocation, useParams } from 'react-router'
import { useTheme } from 'src/layout/ThemeContext'
import { SUPPORTED_LANGUAGES } from 'src/locale/allTranslations'

// Backward-compatibility shim for links that still carry a language prefix
// (/he, /en, /ru, /ar) — the URL scheme no longer includes one. It applies the
// prefixed language, then redirects to the same path without the prefix
// (preserving query string and hash). A first segment that isn't a known
// language falls through to the homepage, matching the catch-all route.
//
// Isolated on purpose: delete this file and its `:lang/*` route in index.tsx
// once old prefixed links have aged out.
export const LegacyLangRedirect = () => {
  const { lang, '*': rest } = useParams()
  const { search, hash } = useLocation()
  const { setLanguage } = useTheme()
  const isKnownLang = lang !== undefined && SUPPORTED_LANGUAGES.includes(lang)

  useEffect(() => {
    if (isKnownLang && lang) setLanguage(lang)
  }, [isKnownLang, lang, setLanguage])

  return <Navigate to={isKnownLang ? { pathname: `/${rest ?? ''}`, search, hash } : '/'} replace />
}
