import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { REGISTRATION_CLOSE_ISO, REGISTRATION_FORM_URL } from './challenges'
import { computeTimeLeft } from './Countdown'

const RegistrationEmbed = () => {
  const { t } = useTranslation()
  const [isClosed, setIsClosed] = useState(() => computeTimeLeft(REGISTRATION_CLOSE_ISO).isClosed)

  useEffect(() => {
    if (isClosed) return
    const id = window.setInterval(() => {
      const closed = computeTimeLeft(REGISTRATION_CLOSE_ISO).isClosed
      if (closed) {
        setIsClosed(true)
        window.clearInterval(id)
      }
    }, 30_000)
    return () => window.clearInterval(id)
  }, [isClosed])

  if (isClosed) {
    return (
      <Closed>
        <h3>{t('hackathonPage.registrationClosed')}</h3>
        <p>{t('hackathonPage.registrationClosedNote')}</p>
      </Closed>
    )
  }

  const openInTabUrl = REGISTRATION_FORM_URL.replace('?embedded=true', '')

  return (
    <Wrapper>
      <Iframe
        src={REGISTRATION_FORM_URL}
        title={t('hackathonPage.registrationFormTitle')}
        loading="lazy"
      />
      <Fallback>
        {t('hackathonPage.formTrouble')}{' '}
        <a href={openInTabUrl} target="_blank" rel="noopener noreferrer">
          {t('hackathonPage.openFormInNewTab')}
        </a>
      </Fallback>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Iframe = styled.iframe`
  width: 100%;
  min-height: 800px;
  border: 0;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
`

const Fallback = styled.p`
  font-size: 13px;
  text-align: center;
  opacity: 0.7;
  margin: 0;
`

const Closed = styled.div`
  padding: 32px 16px;
  text-align: center;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  h3 {
    font-size: 22px;
    margin: 0 0 8px;
  }
  p {
    margin: 0;
    opacity: 0.8;
  }
`

export default RegistrationEmbed
