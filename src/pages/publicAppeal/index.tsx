import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Space, Typography } from 'antd'
import Widget from 'src/shared/Widget'

import './PublicAppeal.scss'
const { Title } = Typography
const pageName = 'publicAppealPage'
const PublicAppeal = () => {
  const { t } = useTranslation()
  const tasks = t(`${pageName}.tasks`, { returnObjects: true })

  return (
    <PublicAppealStyle>
      <Space direction="vertical" size="middle">
        <Title className="page-title" level={3}>
          {t(`${pageName}.title`)}
        </Title>
        {tasks.map((task, i) => (
          <Task title={task.title} description={task.description} index={i} key={i} />
        ))}
      </Space>
    </PublicAppealStyle>
  )
}

type TaskDetails = {
  index: number
  title: string
  description: string
}

const Task = ({ index, title, description }: TaskDetails) => {
  return (
    <Widget key={index}>
      <h2 className="public">{title}</h2>
      <p>{description}</p>
      <a href="https://open-bus-stride-api.hasadna.org.il/docs">Open Bus Stride API</a>
    </Widget>
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
