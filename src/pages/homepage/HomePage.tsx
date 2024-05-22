import { NavLink, To } from 'react-router-dom'
import busImage from '../../img/busImg.png'
import './HomePage.scss'
import { useTranslation } from 'react-i18next'
import {
  DirectionsBusOutlined,
  HistoryOutlined,
  MapOutlined,
  ViewKanbanOutlined,
} from '@mui/icons-material'
import { SvgIconProps } from '@mui/material'

export const HomePage = () => {
  const { t } = useTranslation()

  return (
    <div className="container">
      <img src={busImage} alt="Public Transportaion Bus Illustration" />
      <h1>{t('homepage.welcome')}</h1>
      <h2>{t('homepage.databus_definition')}</h2>
      <p>{t('homepage.website_goal')}</p>
      <section className="links">
        <PageLink icon={<HistoryOutlined />} label={t('timeline_page_title')} to="/timeline" />
        <PageLink icon={<DirectionsBusOutlined />} label={t('gaps_page_title')} to="/gaps" />
        <PageLink
          icon={<ViewKanbanOutlined />}
          label={t('gaps_patterns_page_title')}
          to="/gaps_patterns"
        />
        <PageLink icon={<MapOutlined />} label={t('time_based_map_page_title')} to="/map" />
      </section>
      <footer>{`${t('homepage.copyright')} ${new Date().getFullYear()}`}</footer>
    </div>
  )
}

const PageLink = ({
  icon,
  label,
  to,
}: {
  icon: React.ReactElement<SvgIconProps>
  label: string
  to: To
}) => {
  const { t } = useTranslation()

  return (
    <div className="page-link">
      {icon}
      <span>{label}</span>
      <NavLink to={to}>{t('homepage.show_button')}</NavLink>
    </div>
  )
}

export default HomePage
