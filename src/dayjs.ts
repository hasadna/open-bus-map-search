import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import minMax from 'dayjs/plugin/minMax.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import 'dayjs/locale/he.js'

// Extend dayjs with all required plugins
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(minMax)
dayjs.extend(isoWeek)

// Set default timezone
dayjs.tz.setDefault('Asia/Jerusalem')

// Set default locale
dayjs.locale('he')

export default dayjs

export type Dayjs = dayjs.Dayjs
