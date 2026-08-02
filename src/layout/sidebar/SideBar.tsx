import { Drawer, Layout } from 'antd'
import cn from 'classnames'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutContextInterface, LayoutCtx } from '../LayoutContext'
import { useTheme } from '../ThemeContext'
import Menu from './menu/Menu'
import './sidebar.scss'

const { Sider } = Layout

export default function SideBar() {
  const { i18n } = useTranslation()
  const { drawerOpen, setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const [collapsed, setCollapsed] = useState(false)
  const { isDarkTheme } = useTheme()

  return (
    <>
      <Drawer
        placement={i18n.dir() === 'rtl' ? 'right' : 'left'}
        mask
        size={280}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        rootClassName={cn('hideOnDesktop', { dark: isDarkTheme })}
        styles={{ body: { padding: '0' } }}>
        <Menu />
      </Drawer>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth={60}
        width={250}
        collapsible
        collapsed={collapsed}
        style={{
          marginBottom: '48px',
          boxShadow: isDarkTheme ? '0 0 12px 4px rgba(0,0,0,0.7)' : '0 0 12px 4px rgba(0,0,0,0.12)',
        }}
        onCollapse={setCollapsed}
        className={cn('hideOnMobile', { dark: isDarkTheme })}>
        <Menu collapsed={collapsed} compact />
      </Sider>
    </>
  )
}
