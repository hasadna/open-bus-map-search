import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

// A quiet, non-sticky footer marking the end of the content so pages don't feel
// cut off at the bottom edge. The top margin gives the content some breathing
// room before the footer.
const StyledFooter = styled('footer')(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  padding: theme.spacing(2, 3, 2),
  textAlign: 'center',
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary,
  borderTop: `1px solid ${theme.palette.divider}`,
}))

export function AppFooter() {
  const { t } = useTranslation()

  return <StyledFooter>{`${t('homepage.copyright')} ${new Date().getFullYear()}`}</StyledFooter>
}
