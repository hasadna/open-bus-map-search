import { FC, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
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
  const { t } = useTranslation()
  const location = useLocation()
  const { search } = useContext(GlobalSearchContext)
  const { params: pageParams } = useContext(PageShareParamsContext)

  const handleClick = () => {
    // Before navigation to the "report-a-bug" page, get the page state as a shareable link
    if (path === '/report-a-bug') {
      const contextUrl = buildShareUrl(location.pathname, search, pageParams)
      navigate(`${path}?context=${encodeURIComponent(contextUrl)}`)
      return
    }
    navigate(path)
  }

  return (
    <div aria-label={t(label)} title={t(label)} className="header-link" onClick={handleClick}>
      {icon}
    </div>
  )
}

export default HeaderLinks
