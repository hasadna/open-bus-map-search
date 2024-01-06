import { GithubOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import './GitHubLink.scss'

export default function GitHubLink() {
  const { t } = useTranslation()

  const data = {
    label: t('github_link'),
    path: 'https://github.com/hasadna/open-bus-map-search',
    icon: <GithubOutlined />,
    element: null,
  }

  const handleClick = useCallback(() => {
    window.open(data.path, '_blank')
  }, [])

  return (
    <div className="github-link" onClick={handleClick}>
      {data.icon}
    </div>
  )
}
