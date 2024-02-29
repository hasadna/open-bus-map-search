import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import './HeaderLinks.scss'
import { HEADER_LINKS } from 'src/routes'

type LinkType = { component: (typeof HEADER_LINKS)[number] }

const HeaderLinks: FC = () => {
  return (
    <div className="header-links">
      {HEADER_LINKS.map((item) => {
        if (item.element === null) {
          return <ExternalLink key={item.label} component={item} />
        } else {
          return <InternalLink key={item.label} component={item} />
        }
      })}
    </div>
  )
}

const ExternalLink: FC<LinkType> = ({ component }) => {
  const { label, path, icon } = component
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

const InternalLink: FC<LinkType> = ({ component }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { label, path, icon } = component
  return (
    <div
      aria-label={t(label)}
      title={t(label)}
      className="header-link"
      onClick={() => navigate(path)}>
      {icon}
    </div>
  )
}

export default HeaderLinks
