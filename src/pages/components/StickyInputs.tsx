import { styled } from '@mui/material/styles'

// Pinned filter section. Uses the MUI theme's default page background (the same
// color ScopedCssBaseline paints) so scrolling results don't bleed through it
// in either light or dark mode. `background: inherit` was transparent here
// because PageContainer has no explicit background.
export const StickyInputs = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backgroundColor: theme.palette.background.default,
  paddingBottom: 8,
}))
