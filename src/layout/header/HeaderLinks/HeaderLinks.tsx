import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { HEADER_LINKS, PAGES } from 'src/routes'
import './HeaderLinks.scss'

type LinkType = Omit<(typeof HEADER_LINKS)[number], 'element'>
const LANG_PREFIXES = new Set(['he', 'en', 'ru', 'ar'])

function normalizeRoutePath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  if (LANG_PREFIXES.has(segments[0])) {
    segments.shift()
  }
  return segments.length ? `/${segments.join('/')}` : '/'
}

type HeaderLinksProps = {
  children?: React.ReactNode
}

const HeaderLinks: FC<HeaderLinksProps> = ({ children }) => {
  return (
    <div className="header-links">
      {children}
      {HEADER_LINKS.map((item) => {
        if (item.element === null) {
          return (
            <ExternalLink key={item.label} label={item.label} icon={item.icon} path={item.path} />
          )
        } else {
          return (
            <InternalLink key={item.label} label={item.label} icon={item.icon} path={item.path} />
          )
        }
      })}
    </div>
  )
}

const ExternalLink = ({ label, path, icon }: LinkType) => {
  const { t } = useTranslation()
  function handleClick() {
    window.open(path, '_blank')
  }
  return (
    <div className="header-link" aria-label={t(label)} title={t(label)} onClick={handleClick}>
      {icon}
    </div>
  )
}

const InternalLink = ({ label, path, icon }: LinkType) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const currentRoute = PAGES.find((page) => page.path === normalizeRoutePath(location.pathname))

  return (
    <div
      aria-label={t(label)}
      title={t(label)}
      className="header-link"
      onClick={() => {
        navigate(path, {
          state: currentRoute
            ? {
                from: {
                  path: `${location.pathname}${location.search}`,
                  title: t(currentRoute.label),
                },
              }
            : undefined,
        })
      }}>
      {icon}
    </div>
  )
}

export default HeaderLinks
