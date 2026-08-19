import { DatasetTwoTone, GroupsTwoTone } from '@mui/icons-material'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tab,
  Tabs,
  Tooltip,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ParseKeys } from 'i18next'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { LayoutContextInterface, LayoutCtx } from 'src/layout/LayoutContext'
import DonateModal from 'src/pages/DonateModal/DonateModal'
import { PAGES } from 'src/routes'

type MainMenuProps = {
  collapsed?: boolean
  /* Density only — both the sider and the drawer fit themselves to the space they get
     (see NavList). The sider is driven by a mouse and shares its screen with the page, so
     it starts tighter; the drawer owns the whole viewport and is touched, so it starts
     roomy. */
  compact?: boolean
}

type MenuSection = {
  key: ParseKeys
  icon: React.ReactElement
  groups: { key?: ParseKeys; paths: string[] }[]
}

/* The nav splits along the site's two halves: the data you came to look at, and the
   people who collect it. They aren't peers — data pages are working surfaces you move
   between mid-task, community pages are read-once destinations — so tabbing them keeps
   the working set short while promoting "about"/"donate" from a subheading buried
   two-thirds down the list to one of two always-visible labels. */
const MENU_SECTIONS: MenuSection[] = [
  {
    key: 'menu_section_data',
    icon: <DatasetTwoTone />,
    groups: [
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
      { key: 'menu_group_maps', paths: ['/map', '/velocity-heatmap'] },
    ],
  },
  {
    key: 'menu_section_community',
    icon: <GroupsTwoTone />,
    // One unnamed group: inside a tab already labelled "community", a "community"
    // subheader is noise.
    groups: [{ paths: ['/public-appeal', '/about', '/donate'] }],
  },
]

const sectionOfPath = (pathname: string): ParseKeys | undefined =>
  MENU_SECTIONS.find((section) => section.groups.some((group) => group.paths.includes(pathname)))
    ?.key

// antd's menu blues, kept as they were so the selected row survives the port unchanged
const SELECTED_COLORS = {
  light: { backgroundColor: '#e6f4ff', color: '#1677ff' },
  dark: { backgroundColor: '#1668dc', color: '#fff' },
}

const ROW_HEIGHT = { compact: 36, roomy: 44 }
/* WCAG 2.5.8 puts the floor for a pointer target at 24px. The sider is driven by a mouse
   so it can approach that; the drawer is touched, so it keeps a larger floor and lets the
   drawer scroll rather than shrink past it. */
const MIN_ROW_HEIGHT = { compact: 28, roomy: 32 }

/* Owns the padding and splits the height: the tab strip is fixed overhead (like the
   subheaders), and the section list takes whatever is left. */
const MenuShell = styled('div', {
  shouldForwardProp: (prop) => prop !== 'compact',
})<Pick<MainMenuProps, 'compact'>>(({ compact }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  boxSizing: 'border-box',
  padding: compact ? '4px 8px 8px' : '8px 10px 12px',
}))

/* Deliberately NOT the rows' selected treatment: a tab picks which list you are looking
   at, a row picks which page is open. Giving both the same filled pill made the strip read
   as two more menu rows, so the tabs take the conventional underline instead, over a rule
   that reads as the top edge of the list they control. The accent is the theme's primary
   rather than the rows' antd blue, which keeps the two states visibly different. */
const SectionTabs = styled(Tabs, {
  shouldForwardProp: (prop) => prop !== 'compact',
})<Pick<MainMenuProps, 'compact'>>(({ theme, compact }) => ({
  flex: '0 0 auto',
  minHeight: 0,
  marginBottom: compact ? 6 : 8,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': { height: 2 },
  '& .MuiTab-root': {
    flex: 1,
    minWidth: 0,
    minHeight: compact ? 34 : 40,
    padding: '4px 8px',
    fontSize: 13,
    fontWeight: 500,
    textTransform: 'none',
    color: theme.palette.text.secondary,
    '& .MuiSvgIcon-root': { fontSize: 20 },
    '&.Mui-selected': { color: theme.palette.primary.main, fontWeight: 700 },
  },
}))

/**
 * Auto-fit: the section list is a flex column sized to whatever the shell leaves it, so
 * the rows absorb the available height and shrink from ROW_HEIGHT toward MIN_ROW_HEIGHT on
 * a short viewport instead of overflowing. Past that floor the list scrolls, which keeps
 * the tab strip pinned above it.
 *
 * Every row is a flex item of one container — the group headings are siblings rather than
 * nested lists — so all rows carry the same shrink weight and stay the same height as each
 * other. Spacing is `gap`, not margins: margins don't shrink, and would pin the rows above
 * their flex basis.
 */
const NavList = styled(List, {
  shouldForwardProp: (prop) => prop !== 'compact' && prop !== 'collapsed',
})<MainMenuProps>(({ theme, compact, collapsed }) => {
  const density = compact ? 'compact' : 'roomy'

  return {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    boxSizing: 'border-box',
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'auto',

    '& .MuiListSubheader-root': {
      // Fixed overhead — only the rows shrink, so the headings stay lean: on a phone three
      // roomy headings cost more than a whole row of the height they're competing for.
      flex: '0 0 auto',
      padding: '6px 12px 2px',
      marginBlockStart: compact ? 4 : 8,
      backgroundColor: 'transparent',
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1.6,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: theme.palette.text.secondary,
    },

    '& .MuiListItem-root': {
      flex: `0 1 ${ROW_HEIGHT[density]}px`,
      minHeight: MIN_ROW_HEIGHT[density],
    },

    '& .MuiListItemButton-root': {
      // The row's height comes from its flex item; the button only fills it.
      height: '100%',
      minHeight: 0,
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

  const [sectionKey, setSectionKey] = useState(
    () => sectionOfPath(pathname) ?? MENU_SECTIONS[0].key,
  )
  /* The tab tracks the URL, but is switchable on its own too — you can browse the
     community list while a data page stays open — so it can't be a plain derivation of
     pathname. Adjusting during render rather than in an effect keeps a cross-section
     navigation (a link in the page body to /about) from painting the old tab for a frame. */
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    const next = sectionOfPath(pathname)
    if (next && next !== sectionKey) setSectionKey(next)
  }
  const section = MENU_SECTIONS.find(({ key }) => key === sectionKey) ?? MENU_SECTIONS[0]

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
      <MenuShell className="sidebar-menu" compact={compact}>
        <SectionTabs
          value={section.key}
          onChange={(_, value: ParseKeys) => setSectionKey(value)}
          compact={compact}
          variant="fullWidth"
          aria-label={t('menu_sections_label')}>
          {MENU_SECTIONS.map(({ key, icon }) =>
            collapsed ? (
              <Tab key={key} value={key} icon={icon} aria-label={t(key)} title={t(key)} />
            ) : (
              <Tab key={key} value={key} label={t(key)} />
            ),
          )}
        </SectionTabs>
        <NavList compact={compact} collapsed={collapsed}>
          {section.groups.flatMap(({ key, paths }) => [
            key && !collapsed ? (
              <ListSubheader key={key} disableSticky>
                {t(key)}
              </ListSubheader>
            ) : null,
            ...paths.map((path) => renderItem(path)),
          ])}
        </NavList>
      </MenuShell>
      <DonateModal isVisible={isDonateModalVisible} onClose={() => setDonateModalVisible(false)} />
    </>
  )
}

export default MainMenu
