import { NavLink, To } from 'react-router'
import './HomePage.scss'
import { useTranslation } from 'react-i18next'
import {
  DirectionsBusOutlined,
  HistoryOutlined,
  MapOutlined,
  MenuOutlined,
  ViewKanbanOutlined,
} from '@mui/icons-material'
import { SvgIconProps, Tooltip } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import busImage from '../../img/busImg.png'
import { LayoutContextInterface, LayoutCtx } from 'src/layout/LayoutContext'

const PageLink = ({
  icon,
  label,
  to,
}: {
  icon: React.ReactElement<SvgIconProps>
  label: string
  to: To | (() => void)
}) => {
  const { t } = useTranslation()

  return (
    <div className="page-link">
      {icon}
      <span>{label}</span>
      {typeof to == 'function' ? (
        <a onClick={to}>{t('homepage.show_button')}</a>
      ) : (
        <NavLink to={to}>{t('homepage.show_button')}</NavLink>
      )}
    </div>
  )
}

const wrapToolTip = (element: React.ReactElement, description: string) => {
  return (
    <Tooltip
      placement={'top'}
      title={<div style={{ fontSize: 15, textAlign: 'center' }}>{description}</div>}
      followCursor={true}>
      {element}
    </Tooltip>
  )
}

export const HomePage = () => {
  const { t } = useTranslation()
  const [isWide, setIsWide] = useState(window.innerWidth > 450 ? true : false)
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)

  useEffect(() => {
    const handleResize = () => {
      setIsWide(window.innerWidth > 450 ? true : false)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="container">
      <img src={busImage} alt="Public Transportaion Bus Illustration" />
      <h1>{t('homepage.welcome')}</h1>
      <h2>{t('homepage.databus_definition')}</h2>
      <p>{t('homepage.website_goal')}</p>
      {isWide ? (
        <section className="links">
          <PageLink
            icon={wrapToolTip(<HistoryOutlined />, t('timeline_page_description'))}
            label={t('timeline_page_title')}
            to="/timeline"
          />
          <PageLink
            icon={wrapToolTip(<DirectionsBusOutlined />, t('gaps_page_description'))}
            label={t('gaps_page_title')}
            to="/gaps"
          />
          <PageLink
            icon={wrapToolTip(<ViewKanbanOutlined />, t('gaps_patterns_page_description'))}
            label={t('gaps_patterns_page_title')}
            to="/gaps_patterns"
          />
          <PageLink
            icon={wrapToolTip(<MapOutlined />, t('time_based_map_page_description'))}
            label={t('time_based_map_page_title')}
            to="/map"
          />
        </section>
      ) : (
        <section className="menu-link">
          <PageLink
            icon={wrapToolTip(<MenuOutlined />, t('open_menu_description'))}
            label={t('homepage.open_menu')}
            to={() => {
              setDrawerOpen(true)
            }}
          />
        </section>
      )}
      <footer>{`${t('homepage.copyright')} ${new Date().getFullYear()}`}</footer>
    </div>
  )
}

export default HomePage
