import styled from 'styled-components'
import SlackIcon from '../../resources/slack-icon.svg'
import { Trans, useTranslation } from 'react-i18next'
import Widget from 'src/shared/Widget'
import { Space, Typography } from 'antd'

import './PublicAppeal.scss'
const { Title } = Typography
const pageName = 'publicAppealPage'
const PublicAppeal = () => {
  const { t } = useTranslation()
  return (
    <PublicAppealStyle>
      <Space direction="vertical" size="middle">
        <Title className="page-title" level={3}>
          {t(`${pageName}.title`)}
        </Title>
        <Tasks />
      </Space>
    </PublicAppealStyle>
  )
}

const Tasks = () => {
  const { t } = useTranslation()
  const tasks = t(`${pageName}.tasks`, { returnObjects: true })

  return (
    tasks.map((task) => (
      <Widget>
        <h2 className='public'>{task.title}</h2>
        {/* <p>{t('what_is_website_paragraph')}</p> */}
        <p>{task.description}</p>
        <a href="https://www.google.com">{task.swagger}</a>
        <p>jupyter notebook</p>
      </Widget>
    ))
  )
}

const PublicAppealStyle = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
  & .public-appeal-center-container {
    width: 100%;
    max-width: 770px;
    & h1 {
      font-size: 2em;
    }
  }
`

export default PublicAppeal
