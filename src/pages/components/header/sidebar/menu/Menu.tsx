import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import cn from 'classnames'
import './menu.scss'
import { useTranslation } from 'react-i18next'
import { PAGES as pages } from 'src/routes'

const Menu = () => {
  const { t, i18n } = useTranslation()

  const [currentLanguage, setCurrentLanguage] = useState('en')

  const navigate = useNavigate()
  const { pathname: currpage } = useLocation()

  const handleChangeLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'he' : 'en'
    setCurrentLanguage(newLanguage)
    i18n.changeLanguage(newLanguage)
  }

  return (
    <ul className="menu">
      {pages.map((page) => (
        <li
          className={cn('menu-item', { active: currpage === page.path })}
          key={page.path}
          onClick={() =>
            page.path[0] === '/' ? navigate(page.path) : window.open(page.path, '_blank')
          }>
          {React.createElement(page.icon)}
          {
            <span
              style={{
                width: '15px',
              }}
            />
          }
          {t(page.label)}
        </li>
      ))}
      {null && <button onClick={handleChangeLanguage}>Change Language</button>}
    </ul>
  )
}

export default Menu
