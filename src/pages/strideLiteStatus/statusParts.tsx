import { Alert, AlertTitle, Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export const StatTile = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, height: '100%' }}>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Typography>
  </Box>
)

export const Unreachable = ({ error }: { error: Error }) => {
  const { t } = useTranslation()
  return (
    <Alert severity="warning">
      <AlertTitle>{t('strideLite.unreachable')}</AlertTitle>
      <Typography variant="body2">{error.message}</Typography>
    </Alert>
  )
}
