import { BarChartOutlined, FieldTimeOutlined, LineChartOutlined } from '@ant-design/icons'
import {
  DirectionsBusOutlined,
  MapOutlined,
  MenuOutlined,
  RouteOutlined,
} from '@mui/icons-material'
import { SvgIconProps, Tooltip } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, To } from 'react-router'
import { LayoutContextInterface, LayoutCtx } from 'src/layout/LayoutContext'
import { BusImage } from './BusImage'
import './HomePage.scss'

const PageLink = ({
  icon,
  label,
  to,
  description,
}: {
  icon: React.ReactElement<SvgIconProps>
  label: string
  to: To | (() => void)
  description: string
}) => {
  const content = (
    <div className="page-link-inner">
      <div className="page-link-circle">{icon}</div>
      <span className="page-link-label">{label}</span>
    </div>
  )
  const tooltipTitle = <div style={{ fontSize: 15, textAlign: 'center' }}>{description}</div>

  if (typeof to === 'function') {
    return (
      <Tooltip title={tooltipTitle} placement="top">
        <button onClick={to} className="page-link" type="button">
          {content}
        </button>
      </Tooltip>
    )
  }

  return (
    <Tooltip title={tooltipTitle} placement="top">
      <NavLink to={to} className="page-link">
        {content}
      </NavLink>
    </Tooltip>
  )
}

export const HomePage = () => {
  const { t } = useTranslation()
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)

  return (
    <div className="container">
      <BusImage role="img" aria-label={t('homepage.bus_illustration_alt')} />
      <h1>{t('homepage.welcome')}</h1>
      <h2>{t('homepage.databus_definition')}</h2>
      <p>{t('homepage.website_goal')}</p>

      <section className="links hideOnMobile">
        <PageLink
          icon={<RouteOutlined />}
          label={t('singleline_map_page_title')}
          to="/single-line-map"
          description={t('singleline_map_page_description')}
        />
        <PageLink
          icon={<FieldTimeOutlined />}
          label={t('timeline_page_title')}
          to="/timeline"
          description={t('timeline_page_description')}
        />
        <PageLink
          icon={<BarChartOutlined />}
          label={t('gaps_page_title')}
          to="/gaps"
          description={t('gaps_page_description')}
        />
        <PageLink
          icon={<LineChartOutlined />}
          label={t('gaps_patterns_page_title')}
          to="/gaps_patterns"
          description={t('gaps_patterns_page_description')}
        />
        <PageLink
          icon={<DirectionsBusOutlined />}
          label={t('operator_title')}
          to="/operator"
          description={t('operator_title')}
        />
        <PageLink
          icon={<MapOutlined />}
          label={t('time_based_map_page_title')}
          to="/map"
          description={t('time_based_map_page_description')}
        />
      </section>

      <section className="menu-link hideOnDesktop">
        <PageLink
          icon={<MenuOutlined />}
          label={t('homepage.open_menu')}
          to={() => {
            setDrawerOpen(true)
          }}
          description={t('open_menu_description')}
        />
      </section>

      <footer>{`${t('homepage.copyright')} ${new Date().getFullYear()}`}</footer>
    </div>
  )
}

export default HomePage
