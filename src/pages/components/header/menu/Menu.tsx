import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import cn from 'classnames'
import './menu.scss'
import { useTranslation } from 'react-i18next'

export type MenuPage = {
  label: string
  key: string
  icon: string
}

function Menu({ pages }: { pages: MenuPage[] }) {
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
          className={cn('menu-item', { active: currpage === page.key })}
          key={page.key}
          onClick={() =>
            page.key[0] === '/' ? navigate(page.key) : window.open(page.key, '_blank')
          }>
          {React.createElement(page.icon)}
          {
            <span
              style={{
                width: '15px',
              }}
            />
          }
          {page.label}
        </li>
      ))}
      {null && <button onClick={handleChangeLanguage}>Change Language</button>}
    </ul>
  )
}

export default Menu
