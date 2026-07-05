import { BugOutlined, GithubOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import IconButton from '@mui/material/IconButton'
import { Drawer, Layout } from 'antd'
import cn from 'classnames'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { PAGES } from 'src/routes'
import { LayoutContextInterface, LayoutCtx } from '../LayoutContext'
import { useTheme } from '../ThemeContext'
import { LanguageToggleButton } from '../header/LanguageToggleButton'
import { ShareButton } from '../header/ShareButton'
import ToggleThemeButton from '../header/ToggleThemeButton'
import { Logo } from './logo'
import Menu from './menu/Menu'
import './sidebar.scss'

const { Sider } = Layout

const CollapsedLogo = () => <h1 className={'sidebar-logo-collapsed'}>🚌</h1>

export default function SideBar() {
  const { t, i18n } = useTranslation()
  const { drawerOpen, setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const [collapsed, setCollapsed] = useState(false)
  const { isDarkTheme, currentLanguage, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <>
      <Drawer
        placement={i18n.dir() === 'rtl' ? 'right' : 'left'}
        mask
        size={280}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        rootClassName={cn('hideOnDesktop', { dark: isDarkTheme })}
        styles={{ body: { padding: '0' } }}
        extra={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShareButton />
            <LanguageToggleButton />
            <ToggleThemeButton toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />
            <IconButton size="small" aria-label={t('report_a_bug_title')} title={t('report_a_bug_title')} onClick={() => navigate('/report-a-bug')}>
              <BugOutlined />
            </IconButton>
            <IconButton size="small" aria-label={t('github_link')} title={t('github_link')} onClick={() => window.open('https://github.com/hasadna/open-bus-map-search', '_blank')}>
              <GithubOutlined />
            </IconButton>
          </div>
        }>
        <Logo title={t('website_name')} dark={isDarkTheme} />
        <div className="sidebar-divider" />
        <Menu />
      </Drawer>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth={60}
        width={250}
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{
          boxShadow: isDarkTheme ? '0 0 12px 4px rgba(0,0,0,0.7)' : '0 0 12px 4px rgba(0,0,0,0.12)',
        }}
        onCollapse={setCollapsed}
        className={cn('hideOnMobile', { dark: isDarkTheme })}>
        <div className="sider-inner">
          <div className="sider-scroll">
            <Link to={`/${currentLanguage}${PAGES[0].path}`} replace>
              {collapsed ? <CollapsedLogo /> : <Logo title={t('website_name')} dark={isDarkTheme} />}
            </Link>
            <div className="sidebar-divider" />
            <Menu collapsed={collapsed} />
          </div>
          <div className="sider-footer">
            <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <RightOutlined /> : <LeftOutlined />}
            </IconButton>
            {!collapsed && (
              <>
                <ShareButton />
                <LanguageToggleButton />
                <ToggleThemeButton toggleTheme={toggleTheme} isDarkTheme={isDarkTheme} />
                <IconButton size="small" aria-label={t('report_a_bug_title')} title={t('report_a_bug_title')} onClick={() => navigate('/report-a-bug')}>
                  <BugOutlined />
                </IconButton>
                <IconButton size="small" aria-label={t('github_link')} title={t('github_link')} onClick={() => window.open('https://github.com/hasadna/open-bus-map-search', '_blank')}>
                  <GithubOutlined />
                </IconButton>
              </>
            )}
          </div>
        </div>
      </Sider>
    </>
  )
}
