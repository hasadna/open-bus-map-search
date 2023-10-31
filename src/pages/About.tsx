import styled from 'styled-components'
import { TEXT_KEYS } from 'src/resources/texts'
import SlackIcon from '../resources/slack-icon.svg'
import { useTranslation } from 'react-i18next'

const About = () => {
  const { t } = useTranslation()

  return (
    <AboutStyle>
      <div className="about-center-container">
        <h1>{t(TEXT_KEYS.website_name)}</h1>
        <WhatIsWebsite />
        <DiscoveredMistake />
        <Privacy />
        <License />
        <Questions />
        <Funding />
      </div>
    </AboutStyle>
  )
}

const WhatIsWebsite = () => {
  const { t } = useTranslation()

  return (
    <ParagraphStyle>
      <h2>{t(TEXT_KEYS.what_is_website)}</h2>
      <p>{t(TEXT_KEYS.what_is_website_paragraph)}</p>
      <ul style={{ listStyle: 'disc', paddingRight: '40px' }}>
        <li>{t(TEXT_KEYS.planning_information)}</li>
        <li>{t(TEXT_KEYS.performance_information)}</li>
      </ul>
    </ParagraphStyle>
  )
}

const DiscoveredMistake = () => {
  const { t } = useTranslation()

  return (
    <ParagraphStyle>
      <h2>{t(TEXT_KEYS.discovered_mistake)}</h2>
      <p>{t(TEXT_KEYS.discovered_mistake_paragraph)}</p>
    </ParagraphStyle>
  )
}

const Privacy = () => {
  const { t } = useTranslation()

  return (
    <ParagraphStyle>
      <h2>{t(TEXT_KEYS.privacy)}</h2>
      <p>
        באתר מוטמע שירות{' '}
        <a href="https://marketingplatform.google.com/about/analytics/">Google Analytics </a>
        לניתוח דפוסי השימוש ומיצוב האתר במנועי חיפוש. קוד זה חושף בפני מפעילי השירות מידע בנוגע
        להתנהגות המשתמשים.
        <a href="https://support.google.com/analytics/answer/6004245?hl=iw"> קראו כאן </a>
        על מדיניות הפרטיות של השירות.
      </p>
    </ParagraphStyle>
  )
}

const License = () => {
  const { t } = useTranslation()

  return (
    <ParagraphStyle>
      <h2>{t(TEXT_KEYS.license)}</h2>
      <p>
        כל המידע המוצג באתר מבוסס על נתונים המפורסמים במקורות המידע הממשלתיים. השימוש במידע כפוף ל
        <a href="https://creativecommons.org/licenses/by-sa/4.0/">רישיון CC BY-SA 4.0 </a>
        של
        <a href="https://creativecommons.org/"> Creative Commons</a>.
      </p>
    </ParagraphStyle>
  )
}

const Questions = () => {
  const { t } = useTranslation()

  return (
    <ParagraphStyle>
      <h2>{t(TEXT_KEYS.questions)}</h2>
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
    </ParagraphStyle>
  )
}

const Funding = () => {
  const { t } = useTranslation()

  return (
    <ParagraphStyle>
      <h2>{t(TEXT_KEYS.funding)}</h2>
      <p>{t(TEXT_KEYS.funding_paragraph)}</p>
      <ul>
        <li>{t(TEXT_KEYS.mr_meir)}</li>
        <li>{t(TEXT_KEYS.innovation_authority)}</li>
        <li>{t(TEXT_KEYS.migdal_company)}</li>
        <li>
          <a href="https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal">
            {t(TEXT_KEYS.and_smaller_donors)}
          </a>
        </li>
      </ul>
    </ParagraphStyle>
  )
}

const AboutStyle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  & .about-center-container {
    width: 100%;
    max-width: 770px;
    & h1 {
      font-size: 2em;
    }
  }
`

const ParagraphStyle = styled.div`
  & h2 {
    font-size: 1.5em;
  }
  & p {
    font-size: 1.15em;
  }

  & ul {
    list-style: none;
    padding: 0;
  }
  & img {
    width: 5%;
  }
`

export default About
