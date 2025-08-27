import { Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import './PublicAppeal.scss'
import Widget from 'src/shared/Widget'

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
          <Task {...task} marginBottom={tasks.length - 1 === i} key={i} />
        ))}
      </Space>
    </PublicAppealStyle>
  )
}

type TaskDetails = {
  title: string
  description: string
  marginBottom?: boolean
}

const Task = ({ title, description, marginBottom }: TaskDetails) => {
  return (
    <Widget title={title} marginBottom={marginBottom}>
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
