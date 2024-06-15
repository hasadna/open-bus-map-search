import { NavLink, To } from 'react-router-dom'
import './HomePage.scss'
import { useTranslation } from 'react-i18next'
import {
  DirectionsBusOutlined,
  HistoryOutlined,
  MapOutlined,
  ViewKanbanOutlined,
} from '@mui/icons-material'
import { SvgIconProps } from '@mui/material'
import busImage from '../../img/busImg.png'

export const HomePage = () => {
  const { t } = useTranslation()

  return (
    <div className="container">
      <img src={busImage} alt="Public Transportaion Bus Illustration" />
      <h1>{t('homepage.welcome')}</h1>
      <h2>{t('homepage.databus_definition')}</h2>
      <p>{t('homepage.website_goal')}</p>
      <section className="links">
        <PageLink
          icon={<HistoryOutlined />}
          label={t('timeline_page_title')}
          description={t('timeline_page_description')}
          to="/timeline"
        />
        <PageLink
          icon={<DirectionsBusOutlined />}
          label={t('gaps_page_title')}
          description={t('gaps_page_description')}
          to="/gaps"
        />
        <PageLink
          icon={<ViewKanbanOutlined />}
          label={t('gaps_patterns_page_title')}
          description={t('gaps_patterns_page_description')}
          to="/gaps_patterns"
        />
        <PageLink
          icon={<MapOutlined />}
          label={t('time_based_map_page_title')}
          description={t('time_based_map_page_description')}
          to="/map"
        />
      </section>
      <footer>{`${t('homepage.copyright')} ${new Date().getFullYear()}`}</footer>
    </div>
  )
}

const PageLink = ({
  icon,
  label,
  description,
  to,
}: {
  icon: React.ReactElement<SvgIconProps>
  label: string
  description: string
  to: To
}) => {
  const { t } = useTranslation()

  return (
    <div className="page-link">
      {icon}
      <span>{label}</span>
      <NavLink to={to}>{t('homepage.show_button')}</NavLink>
      <p>{description}</p>
    </div>
  )
}

export default HomePage
