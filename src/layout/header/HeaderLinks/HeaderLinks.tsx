import { FC, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { buildShareUrl } from 'src/layout/header/shareUrl'
import { GlobalSearchContext } from 'src/model/globalState'
import { PageShareParamsContext } from 'src/model/routeContext'
import { HEADER_LINKS } from 'src/routes'
import './HeaderLinks.scss'

type LinkType = Omit<(typeof HEADER_LINKS)[number], 'element'>

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
  return (
    <a
      className="header-link"
      aria-label={t(label)}
      title={t(label)}
      href={path}
      target="_blank"
      rel="noopener noreferrer">
      {icon}
    </a>
  )
}

const InternalLink = ({ label, path, icon }: LinkType) => {
  const { t } = useTranslation()
  const location = useLocation()
  const { search } = useContext(GlobalSearchContext)
  const { params: pageParams } = useContext(PageShareParamsContext)

  // Before navigation to the "report-a-bug" page, attach the page state as a shareable link
  const to =
    path === '/report-a-bug'
      ? `${path}?context=${encodeURIComponent(buildShareUrl(location.pathname, search, pageParams))}`
      : path

  return (
    <Link aria-label={t(label)} title={t(label)} className="header-link" to={to}>
      {icon}
    </Link>
  )
}

export default HeaderLinks
