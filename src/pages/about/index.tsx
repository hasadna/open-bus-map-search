import styled from 'styled-components'
import SlackIcon from '../../resources/slack-icon.svg'
import { Trans, useTranslation } from 'react-i18next'
import Widget from 'src/shared/Widget'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import './About.scss'
import { useQuery } from '@tanstack/react-query'

const pageName = 'aboutPage'
const About = () => {
  const { t } = useTranslation()
  return (
    <AboutStyle>
      <Stack spacing={4}>
        <Typography variant="h4" gutterBottom className="page-title">
          {t(`${pageName}.title`)}
        </Typography>
        <WhatIsWebsite />
        <DiscoveredMistake />
        <Privacy />
        <License />
        <Questions />
        <Funding />
        <Attributions />
      </Stack>
      <Contributors />
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

const Privacy = () => {
  const { t } = useTranslation()
  const googlAnalyticsUrl = 'https://marketingplatform.google.com/about/analytics/'
  const googleAnaliticsPrivacyUrl = 'https://support.google.com/analytics/answer/6004245?hl=iw'
  return (
    <Widget>
      <h2>{t('privacy')}</h2>
      <p>
        <Trans i18nKey="aboutPage.privacyText">
          <a href={googlAnalyticsUrl}></a>
          <a href={googleAnaliticsPrivacyUrl}></a>
        </Trans>
      </p>
    </Widget>
  )
}

const License = () => {
  const { t } = useTranslation()
  const licenseLink = 'https://creativecommons.org/licenses/by-sa/4.0/'
  const licenseOrgLink = 'https://creativecommons.org/'
  return (
    <Widget>
      <h2>{t('license')}</h2>
      <p>
        <Trans
          i18nKey="aboutPage.licenseInfo.text"
          values={{ licenseName: t('aboutPage.licenseInfo.licenseName') }}>
          <a href={licenseLink}></a>
          <a href={licenseOrgLink}></a>
        </Trans>
      </p>
    </Widget>
  )
}

const Questions = () => {
  const { t } = useTranslation()
  const linksTextPath = `${pageName}.contactLinksText`
  return (
    <Widget>
      <h2>{t('questions')}</h2>
      <ul>
        <li>
          <a href="https://www.hasadna.org.il/%D7%A6%D7%95%D7%A8-%D7%A7%D7%A9%D7%A8/">
            {t(`${linksTextPath}.sadna`)}
          </a>
        </li>
        <li>
          <img src={SlackIcon} alt="Slack icon" />
          <a href="https://hasadna.slack.com/join/shared_invite/zt-167h764cg-J18ZcY1odoitq978IyMMig#/shared-invite/email">
            {t(`${linksTextPath}.slack`)}
          </a>
        </li>
        <li>
          <a href="https://www.jgive.com/new/he/ils/donation-targets/3268#donation-modal">
            {t(`${linksTextPath}.donations`)}
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

const Attributions = () => {
  return (
    <Widget>
      <h2>Attributions</h2>
      <ul>
        <li>
          Thanks <a href="http://www.applitools.com/">Applitools</a> for the free open-source
          license for their visual testing tool
        </li>
        <li>
          Bus ifmage by{' '}
          <a
            href="https://www.freepik.com/free-vector/passengers-waiting-bus-city-queue-town-road-flat-vector-illustration-public-transport-urban-lifestyle_10173277.htm#query=public%20transportation&position=0&from_view=search&track=ais&uuid=70a79b38-20cb-42b8-9dde-b96a68088522"
            target="_blank"
            rel="noopener noreferrer nofollow">
            pch.vector
          </a>{' '}
          on Freepik
        </li>
      </ul>
    </Widget>
  )
}

const Contributors = () => {
  const { t } = useTranslation()
  const { contributors, isLoading, isError } = useContributions()

  return (
    <Widget>
      <h2>{t('aboutPage.contributors')}</h2>
      <p>
        {t('aboutPage.contributorsText')}
        <br />
        <Trans i18nKey="aboutPage.contributorsReadMore">
          <a href="https://github.com/hasadna/open-bus-map-search/blob/main/CONTRIBUTING.md"></a>
        </Trans>
      </p>
      <ul className="contributions">
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error...</p>}
        {contributors &&
          contributors.map((author) => (
            <li key={author.id}>
              <a href={author.html_url}>
                <h2>{author.login}</h2>
                <img src={author.avatar_url} alt={author.login} />
                <p>
                  {author.contributions} {t('aboutPage.contributions')}
                </p>
              </a>
            </li>
          ))}
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
function useContributions(start: Date = new Date('2023-01-01'), end: Date = new Date()) {
  const owner = 'hasadna'
  const repos = [
    'open-bus-map-search',
    'open-bus-stride-api',
    'open-bus-backend',
    'open-bus-pipelines',
    'open-bus-siri-requester',
    'open-bus-gtfs-etl',
    'open-bus-stride-etl',
  ]

  const apis = repos.map(
    (repo) =>
      `https://api.github.com/repos/${owner}/${repo}/contributors?order=desc&until=${end.toISOString()}&since=${start.toISOString()}`,
  )

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contributors'],
    queryFn: () =>
      Promise.all(
        apis.map((api) =>
          fetch(api)
            .then((res) => res.json())
            .catch(() => ({})),
        ),
      ),
    gcTime: Infinity,
    staleTime: 3 * 24 * 60 * 60 * 1000, // refresh the cached data every 3 days
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    networkMode: 'offlineFirst',
  })

  try {
    const contributors = (data?.flat() as Author[])
      // filter repos with no contributors
      .filter(Boolean)
      // filter out bots
      .filter((a) => a.type === 'User')
      // sort by contributions
      .sort((a: Author, b: Author) => b.contributions - a.contributions)
      .reduce(combineAuthor, [] as Author[])
    return { contributors, isLoading, isError }
  } catch (error) {
    return { contributors: [] as const, isLoading: false, isError: true }
  }
}

// sum contributions of the same user
function combineAuthor(authors: Author[], author: Author) {
  const sameUser = authors.find((a) => a.login === author.login)
  if (!sameUser) {
    authors.push(author)
  } else {
    sameUser.contributions += author.contributions
  }
  return authors
}

type Author = {
  avatar_url: string
  contributions: number
  html_url: string
  id: number
  login: string
  node_id: string
  organizations_url: string
  received_events_url: string
  repos_url: string
  site_admin: boolean
  starred_url: string
  subscriptions_url: string
  type: string
  url: string
}

export default About
