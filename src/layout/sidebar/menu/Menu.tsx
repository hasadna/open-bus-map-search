import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { LayoutContextInterface, LayoutCtx } from 'src/layout/LayoutContext'
import DonateModal from 'src/pages/DonateModal/DonateModal'
import { PAGES } from 'src/routes'

type MainMenuProps = {
  collapsed?: boolean
  /* The desktop sider has a single screen to fit the whole menu in, so its rows are
     tighter; the mobile drawer scrolls the full viewport and keeps touch-sized rows. */
  compact?: boolean
}

const MENU_GROUPS = [
  {
    key: 'menu_group_analysis',
    paths: [
      '/single-line-map',
      '/timeline',
      '/gaps',
      '/gaps_patterns',
      '/operator',
      '/vehicle',
      '/train',
    ],
  },
  {
    key: 'menu_group_maps',
    paths: ['/map', '/velocity-heatmap'],
  },
  {
    key: 'menu_group_community',
    paths: ['/public-appeal', '/about', '/donate'],
  },
] as const

// antd's menu blues, kept as they were so the selected row survives the port unchanged
const SELECTED_COLORS = {
  light: { backgroundColor: '#e6f4ff', color: '#1677ff' },
  dark: { backgroundColor: '#1668dc', color: '#fff' },
}

const NavList = styled(List, {
  shouldForwardProp: (prop) => prop !== 'compact' && prop !== 'collapsed',
})<MainMenuProps>(({ theme, compact, collapsed }) => ({
  padding: compact ? '4px 8px 8px' : '8px 10px 12px',

  '& .menu-group': {
    marginBottom: compact ? 4 : 10,
  },

  '& .MuiListSubheader-root': {
    padding: compact ? '6px 12px 2px' : '8px 12px 6px',
    backgroundColor: 'transparent',
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.6,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
  },

  '& .MuiListItemButton-root': {
    minHeight: compact ? 36 : 44,
    marginBottom: compact ? 2 : 4,
    paddingBlock: 0,
    paddingInline: collapsed ? 0 : 12,
    justifyContent: collapsed ? 'center' : undefined,
    borderRadius: compact ? 8 : 10,
    '&.Mui-selected, &.Mui-selected:hover': SELECTED_COLORS[theme.palette.mode],
  },

  '& .MuiListItemIcon-root': {
    minWidth: 0,
    marginInlineEnd: collapsed ? 0 : 10,
    color: 'inherit',
    '& .MuiSvgIcon-root': { fontSize: 20 },
  },

  '& .MuiListItemText-primary': {
    fontSize: 14,
  },
}))

const MainMenu = ({ collapsed = false, compact = false }: MainMenuProps) => {
  const { t, i18n } = useTranslation()
  const { setDrawerOpen } = useContext<LayoutContextInterface>(LayoutCtx)
  const [isDonateModalVisible, setDonateModalVisible] = useState(false)
  const { pathname } = useLocation()

  // src/routes imports the layout, so PAGES is still in its temporal dead zone while
  // this module initializes — the lookup has to be built at render time.
  const pageByPath = new Map<string, (typeof PAGES)[number]>(PAGES.map((page) => [page.path, page]))

  const handleDonateClick = (event: React.MouseEvent) => {
    event.preventDefault()
    setDonateModalVisible(true)
    setDrawerOpen(false)
  }

  const renderItem = (path: string) => {
    const page = pageByPath.get(path)
    if (!page) return null

    const label = t(page.label)
    const selected = pathname === path
    const ariaCurrent = selected ? 'page' : undefined
    const content = (
      <>
        <ListItemIcon>{page.icon}</ListItemIcon>
        {!collapsed && <ListItemText primary={label} slotProps={{ primary: { noWrap: true } }} />}
      </>
    )

    const button =
      page.label === 'donate_title' ? (
        <ListItemButton
          component="a"
          href="#"
          onClick={handleDonateClick}
          selected={selected}
          aria-current={ariaCurrent}>
          {content}
        </ListItemButton>
      ) : (
        <ListItemButton
          component={Link}
          to={path}
          onClick={() => setDrawerOpen(false)}
          selected={selected}
          aria-current={ariaCurrent}>
          {content}
        </ListItemButton>
      )

    return (
      <ListItem key={path} disablePadding>
        {collapsed ? (
          <Tooltip title={label} placement={i18n.dir() === 'rtl' ? 'left' : 'right'}>
            {button}
          </Tooltip>
        ) : (
          button
        )}
      </ListItem>
    )
  }

  return (
    <>
      <NavList className="sidebar-menu" compact={compact} collapsed={collapsed}>
        {renderItem('/')}
        {collapsed
          ? MENU_GROUPS.flatMap(({ paths }) => paths.map((path) => renderItem(path)))
          : MENU_GROUPS.map(({ key, paths }) => (
              <li key={key} className="menu-group">
                <List
                  disablePadding
                  subheader={<ListSubheader disableSticky>{t(key)}</ListSubheader>}>
                  {paths.map((path) => renderItem(path))}
                </List>
              </li>
            ))}
      </NavList>
      <DonateModal isVisible={isDonateModalVisible} onClose={() => setDonateModalVisible(false)} />
    </>
  )
}

export default MainMenu
