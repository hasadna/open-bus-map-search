import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

// Grows to fill leftover space so the footer sits at the bottom of the scroll
// area on short pages instead of floating just beneath the content. Its
// min-height keeps a little breathing room above the footer on tall (scrolled)
// pages, where the spacer otherwise collapses to zero.
const Spacer = styled('div')(({ theme }) => ({
  flexGrow: 1,
  minHeight: theme.spacing(4),
}))

// A quiet, non-sticky footer marking the end of the content so pages don't feel
// cut off at the bottom edge.
const StyledFooter = styled('footer')(({ theme }) => ({
  flexShrink: 0,
  padding: theme.spacing(2, 3, 3),
  textAlign: 'center',
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary,
  borderTop: `1px solid ${theme.palette.divider}`,
}))

export function AppFooter() {
  const { t } = useTranslation()

  return (
    <>
      <Spacer />
      <StyledFooter>{`${t('homepage.copyright')} ${new Date().getFullYear()}`}</StyledFooter>
    </>
  )
}
