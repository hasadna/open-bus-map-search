import { FC, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next/typescript/t'

import './HeaderLinks.scss'
import { HEADER_LINKS } from 'src/routes'

type ExternalLinkType = {
  component: {
    label: string
    path: string
    icon: ReactNode
  }
  t: (key: string) => string
}

type InternalLinkType = ExternalLinkType & {
  component: ExternalLinkType['component'] & {
    element: ReactNode
  }
}

const HeaderLinks: FC = () => {
  const { t } = useTranslation()
  return (
    <div className="header-links">
      {HEADER_LINKS.map((item) => {
        if (item.element == null) {
          return <ExternalLink key={item.label} component={item} t={t} />
        } else {
          return <InternalLink key={item.label} component={item} t={t} />
        }
      })}
    </div>
  )
}

const ExternalLink: FC<ExternalLinkType> = ({ component, t }) => {
  const { label, path, icon } = component
  function handleClick() {
    window.open(path, '_blank')
  }
  return (
    <div className="header-link" aria-label={t(label)} title={t(label)} onClick={handleClick}>
      {icon}
    </div>
  )
}

const InternalLink: FC<InternalLinkType> = ({ component, t }) => {
  const navigate = useNavigate()
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
