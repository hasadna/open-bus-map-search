import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Centered = styled.div`
  text-align: center;
`

export const ErrorPage = () => {
  const { t } = useTranslation()
  return (
    <Centered>
      <h1>{t('errorPage.title')}</h1>
      <section>
        <p>{t('errorPage.text')}</p>
        <br />
        <img src="https://media0.giphy.com/media/YcLorQZbPI4Ks/giphy.gif" alt="error" />
        <br />
        <p>
          {t('errorPage.text2')} <br />
          <a href="https://github.com/hasadna/open-bus-map-search/issues/new">
            https://github.com/hasadna/open-bus-map-search/issues/new
          </a>
        </p>
      </section>
    </Centered>
  )
}
