import { useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { EasterEgg } from './EasterEgg'
import { Button } from '@mui/material'

export const LanguageToggle = () => {
  const { t, i18n } = useTranslation()
  const [, handleChangeLanguage] = useReducer((state: string) => {
    const newLanguage = { he: 'en', en: 'he' }[state]
    i18n.changeLanguage(newLanguage)
    return newLanguage!
  }, 'he')

  return (
    <EasterEgg code="english">
      <Button
        onClick={handleChangeLanguage}
        variant="contained"
        style={{ margin: 'auto', display: 'block' }}>
        {t('Change Language')}
      </Button>
    </EasterEgg>
  )
}
