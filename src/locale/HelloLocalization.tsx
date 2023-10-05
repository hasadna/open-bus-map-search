// Temporary Test Component to check if localization is working

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TEXT_KEYS } from 'src/resources/texts'

const HelloLocalization: React.FC = () => {
  const { t, i18n } = useTranslation()

  const [currentLanguage, setCurrentLanguage] = useState('en')

  const handleChangeLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'he' : 'en'
    setCurrentLanguage(newLanguage)
    i18n.changeLanguage(newLanguage)
  }

  return (
    <div className="App">
      {' '}
      <h1>
        Our Translated Header:
        {t(TEXT_KEYS.realtime_map_explanation)}
      </h1>{' '}
      <h3>Current Language: {currentLanguage}</h3>{' '}
      <button onClick={handleChangeLanguage}>Change Language</button>
    </div>
  )
}

export default HelloLocalization
