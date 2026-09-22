import MoonIcon from '@mui/icons-material/DarkModeTwoTone'
import { Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'

/** Rides are filed under the calendar day they depart on, so a 00:30 departure sits
 *  on the next date rather than on the evening it feels like part of. Say so once,
 *  under the ride list — same outlined-Alert treatment as the vehicle-search notice
 *  on single-line-map. */
export const AfterMidnightHint = () => {
  const { t } = useTranslation()

  return (
    <Alert
      severity="info"
      variant="outlined"
      icon={<MoonIcon />}
      sx={{
        mt: 2,
        alignItems: 'center',
        borderWidth: 2,
        fontSize: { xs: '0.8rem', sm: '0.95rem' },
        fontWeight: 700,
        textAlign: 'justify',
      }}>
      {/* Each half is inline-block so the sentence breaks cleanly between them on
          narrow screens instead of wrapping mid-phrase. */}
      <span style={{ display: 'inline-block' }}>{t('after_midnight_hint')}</span>{' '}
      <span style={{ display: 'inline-block' }}>{t('after_midnight_hint_detail')}</span>
    </Alert>
  )
}
