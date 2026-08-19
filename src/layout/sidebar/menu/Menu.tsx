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

/* antd's menu blues, rebalanced so the two modes carry the same weight: they used to be a
   near-white tint with blue text in light (too faint) against a solid fill with white text
   in dark (too loud, and it rivalled the section chip). Both are now a tinted ground with
   saturated text, which keeps the solid chip above them in the hierarchy either way. */
const SELECTED_COLORS = {
  light: { backgroundColor: '#bae0ff', color: '#0958d9' },
  dark: { backgroundColor: 'rgba(22,119,255,0.26)', color: '#69b1ff' },
}

/* The segmented control, keyed by mode like SELECTED_COLORS above.

   The chip carries the brand blue on purpose: the strip outranks the list it controls, so
   a neutral grey chip left it quieter than the selected row below and the whole strip got
   overlooked. What keeps it from reading as just another row is the track — a recessed
   well, which no row ever sits in — not the absence of colour.

   Track is a black alpha rather than a fixed grey so the well works against whichever
   background the sider happens to have. */
const SEGMENTED = {
  light: { track: 'rgba(0,0,0,0.10)', chip: '#1677ff', chipShadow: '0 3px 6px rgba(0,0,0,0.28)' },
  dark: { track: 'rgba(0,0,0,0.40)', chip: '#1677ff', chipShadow: '0 3px 6px rgba(0,0,0,0.6)' },
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

/* A segmented control, not an underline: the recessed track is what advertises that there
   is a second option at all — an underline only marks the active one, leaving the other as
   inert-looking text that is easy to miss. The indicator is stretched to fill its slot so
   it reads as a raised chip sliding between two visible slots.

   It must also not borrow the rows' selected colours: a tab picks which list you are
   looking at, a row picks which page is open, and giving both the same blue fill made the
   strip read as two more menu rows. */
const SectionTabs = styled(Tabs, {
  shouldForwardProp: (prop) => prop !== 'compact',
})<Pick<MainMenuProps, 'compact'>>(({ theme, compact }) => ({
  flex: '0 0 auto',
  minHeight: 0,
  marginBottom: compact ? 6 : 10,
  padding: 3,
  borderRadius: 10,
  backgroundColor: SEGMENTED[theme.palette.mode].track,
  /* The chip is exactly the scroller's box, so every edge of its shadow that touches the
     scroller gets clipped — all of them but the one facing the strip's centre, which is
     what made the shadow look half-drawn. `!important` is needed because Tabs sets
     `overflow: hidden` as an INLINE style on the scroller (Tabs.js: `overflow:
     scrollerStyle.overflow`); a class rule cannot beat it. Safe here: with two fullWidth
     tabs there is nothing to scroll. */
  overflow: 'visible',
  '& .MuiTabs-scroller': { overflow: 'visible !important' },
  '& .MuiTabs-indicator': {
    height: '100%',
    borderRadius: 7,
    backgroundColor: SEGMENTED[theme.palette.mode].chip,
    boxShadow: SEGMENTED[theme.palette.mode].chipShadow,
    zIndex: 0,
  },
  '& .MuiTab-root': {
    // the indicator is a later sibling, so without this it paints over the label
    position: 'relative',
    zIndex: 1,
    flex: 1,
    minWidth: 0,
    minHeight: compact ? 32 : 36,
    padding: '4px 6px',
    gap: 6,
    // the press/hover fill is clipped to the tab's own box, so without this it lands as a
    // sharp-cornered rectangle inside the rounded track
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'none',
    color: theme.palette.text.secondary,
    '& .MuiSvgIcon-root': { fontSize: 18 },
    '&.Mui-selected': { color: '#fff' },
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
              <Tab key={key} value={key} icon={icon} iconPosition="start" label={t(key)} />
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
