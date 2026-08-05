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
     tighter and the list sizes itself to the sider (see NavList); the mobile drawer
     scrolls the full viewport and keeps roomy, touch-sized rows. */
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

const ROW_HEIGHT = { compact: 36, roomy: 44 }
// WCAG 2.5.8 puts the floor for a pointer target at 24px; stop short of it.
const MIN_ROW_HEIGHT = 28

/**
 * Auto-fit: in the sider the list is a flex column sized to its container, so the rows
 * absorb the available height and shrink toward MIN_ROW_HEIGHT on a short viewport
 * instead of overflowing; past that floor the sider's own overflow scrolls. Every row
 * is a flex item of this one container — the group headings are siblings rather than
 * nested lists — so all rows carry the same shrink weight and stay the same height as
 * each other. Spacing is `gap`, not margins: margins don't shrink, and would pin the
 * rows above their flex basis.
 */
const NavList = styled(List, {
  shouldForwardProp: (prop) => prop !== 'compact' && prop !== 'collapsed',
})<MainMenuProps>(({ theme, compact, collapsed }) => {
  const rowHeight = compact ? ROW_HEIGHT.compact : ROW_HEIGHT.roomy

  return {
    padding: compact ? '4px 8px 8px' : '8px 10px 12px',

    ...(compact && {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      height: '100%',
      boxSizing: 'border-box',
    }),

    '& .MuiListSubheader-root': {
      padding: compact ? '6px 12px 2px' : '8px 12px 6px',
      marginBlockStart: compact ? 4 : 10,
      backgroundColor: 'transparent',
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1.6,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: theme.palette.text.secondary,
      ...(compact && { flex: '0 0 auto' }),
    },

    '& .MuiListItem-root': {
      ...(compact && { flex: `0 1 ${rowHeight}px`, minHeight: MIN_ROW_HEIGHT }),
    },

    '& .MuiListItemButton-root': {
      // In the sider the row's height comes from its flex item, so the button just
      // fills it; in the drawer the button is what sets the height.
      ...(compact ? { height: '100%', minHeight: 0 } : { minHeight: rowHeight, marginBottom: 4 }),
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
  }
})

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
        {MENU_GROUPS.flatMap(({ key, paths }) => [
          collapsed ? null : (
            <ListSubheader key={key} disableSticky>
              {t(key)}
            </ListSubheader>
          ),
          ...paths.map((path) => renderItem(path)),
        ])}
      </NavList>
      <DonateModal isVisible={isDonateModalVisible} onClose={() => setDonateModalVisible(false)} />
    </>
  )
}

export default MainMenu
