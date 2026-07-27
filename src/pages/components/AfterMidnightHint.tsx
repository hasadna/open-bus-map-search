import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

/** Rides are filed under the calendar day they depart on, so a 00:30 departure sits
 *  on the next date rather than on the evening it feels like part of. Say so once,
 *  under the ride list. */
export const AfterMidnightHint = () => {
  const { t } = useTranslation()

  return (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
      {t('after_midnight_hint')}
    </Typography>
  )
}
