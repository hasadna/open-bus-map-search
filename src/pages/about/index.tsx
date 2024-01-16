import styled from 'styled-components'
import SlackIcon from '../../resources/slack-icon.svg'
import { useTranslation } from 'react-i18next'
import Widget from 'src/shared/Widget'
import { Space, Typography } from 'antd'
import MyFormatter from 'src/locale/utils'

import './About.scss'
const { Title } = Typography
const pageName = 'aboutPage'
const About = () => {
  const { t } = useTranslation()
  return (
    <AboutStyle>
      <Space direction="vertical" size="middle">
        <Title className="page-title" level={3}>
          {t(`${pageName}.title`)}
        </Title>
        <WhatIsWebsite />
        <DiscoveredMistake />
        <Privacy />
        <License />
        <Questions />
        <Funding />
      </Space>
    </AboutStyle>
  )
}

const WhatIsWebsite = () => {
  const { t } = useTranslation()

  return (
    <Widget>
      <h2>{t('what_is_website')}</h2>
      <p>{t('what_is_website_paragraph')}</p>
      <ul style={{ listStyle: 'disc', paddingRight: '40px' }}>
        <li>{t('planning_information')}</li>
        <li>{t('performance_information')}</li>
      </ul>
    </Widget>
  )
}

const DiscoveredMistake = () => {
  const { t } = useTranslation()

  return (
    <Widget>
      <h2>{t('discovered_mistake')}</h2>
      <p>{t('discovered_mistake_paragraph')}</p>
    </Widget>
  )
}
const formatLinkWithTranslation = (linkPath: string) => {
  const { t } = useTranslation()
  const path = `${pageName}.${linkPath}`
  return MyFormatter.linkFormatted(t(`${path}.text`), {
    url: t(`${path}.link.url`),
    text: t(`${path}.link.text`),
  })
}

const Privacy = () => {
  const { t } = useTranslation()
  const googleAnaliticsText = formatLinkWithTranslation('googleAnaliticsText')
  const privacyPolicyText = formatLinkWithTranslation(`privacyPolicyText`)
  return (
    <Widget>
      <h2>{t('privacy')}</h2>
      <p>
        {googleAnaliticsText} {privacyPolicyText}
      </p>
    </Widget>
  )
}

const License = () => {
  const { t } = useTranslation()
  const mainLicenseInfo = formatLinkWithTranslation('mainLicenseInfo')
  const organizationLicenseInfo = formatLinkWithTranslation('organizationLicenseInfo')

  return (
    <Widget>
      <h2>{t('license')}</h2>
      <p>
        {mainLicenseInfo}
        {organizationLicenseInfo}
      </p>
    </Widget>
  )
}

const Questions = () => {
  const { t } = useTranslation()

  return (
    <Widget>
      <h2>{t('questions')}</h2>
      <ul>
        <li>
          <a href="https://www.hasadna.org.il/%D7%A6%D7%95%D7%A8-%D7%A7%D7%A9%D7%A8/">
            צרו איתנו קשר
          </a>
        </li>
        <li>
          <img src={SlackIcon} alt="Slack icon" />
          <a href="https://hasadna.slack.com/join/shared_invite/zt-167h764cg-J18ZcY1odoitq978IyMMig#/shared-invite/email">
            דברו איתנו על זה בסלאק
          </a>
        </li>
        <li>
          <a href="https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal">
            שרתים עולים כסף- עזרו לנו להמשיך לתחזק ולפתח את הפרויקט!
          </a>
        </li>
      </ul>
    </Widget>
  )
}

const Funding = () => {
  const { t } = useTranslation()

  return (
    <Widget>
      <h2>{t('funding')}</h2>
      <div>
        <p>
          {t('funding_paragraph')}&nbsp;
          <a href="https://open-bus-stride-api.hasadna.org.il/docs">Open API</a>
        </p>
      </div>
      <ul>
        <li>{t('mr_meir')}</li>
        <li>{t('innovation_authority')}</li>
        <li>{t('migdal_company')}</li>
        <li>
          <a href="https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal">
            {t('and_smaller_donors')}
          </a>
        </li>
      </ul>
    </Widget>
  )
}

const AboutStyle = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
  & .about-center-container {
    width: 100%;
    max-width: 770px;
    & h1 {
      font-size: 2em;
    }
  }
`

export default About
