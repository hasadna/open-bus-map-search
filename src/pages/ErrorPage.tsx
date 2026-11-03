import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

const Centered = styled('div')({
  textAlign: 'center',
})

const newIssueUrl = 'https://github.com/hasadna/open-bus-map-search/issues/new'

export const ErrorPage = () => {
  const { t } = useTranslation()
  return (
    <Centered>
      <h1>{t('errorPage.title')}</h1>
      <section>
        <p>{t('errorPage.text')}</p>
        <br />
        <img src="https://media0.giphy.com/media/YcLorQZbPI4Ks/giphy.gif" alt="" />
        <br />
        <p>
          {t('errorPage.text2')} <br />
          <a href={newIssueUrl}>{newIssueUrl}</a>
        </p>
      </section>
    </Centered>
  )
}
