import { Link, Typography } from '@mui/material'
import { Trans } from 'react-i18next'
import dayjs, { ISRAEL_TIMEZONE } from 'src/dayjs'

/** Rides are filed under the calendar day they depart on, so a 00:30 departure sits
 *  on the next date rather than on the evening it feels like part of. Say so once,
 *  under the ride list, with a shortcut to jump there. */
export const AfterMidnightHint = ({
  date,
  onDateChange,
}: {
  date: string
  onDateChange: (time: dayjs.Dayjs) => void
}) => {
  const nextDay = dayjs.tz(date, ISRAEL_TIMEZONE).add(1, 'day')

  return (
    <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
      <Trans i18nKey="after_midnight_hint">
        <Link
          component="button"
          type="button"
          variant="body2"
          underline="none"
          onClick={() => onDateChange(nextDay)}
        />
      </Trans>
    </Typography>
  )
}
