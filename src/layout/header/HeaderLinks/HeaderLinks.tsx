import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import './HeaderLinks.scss'
import { HEADER_LINKS } from 'src/routes'

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
  return (
    <div
      aria-label={t(label)}
      title={t(label)}
      className="header-link"
      onClick={() => {
        navigate(path)
      }}>
      {icon}
    </div>
  )
}

export default HeaderLinks
