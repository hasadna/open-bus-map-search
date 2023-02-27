import moment, { Moment } from 'moment'
import React from 'react'
import { DatePicker } from 'antd'
import { TEXTS } from 'src/resources/texts'

type DateTimePicker = {
  timestamp: Moment | undefined
  setDateTime: (timestamp: Moment) => void
  showTime?: boolean
}

const JAN_FIRST_2022 = 1641038400000

function isDateDisabled(date: Moment) {
  const END_OF_TODAY = moment().endOf('day')
  return date.isAfter(END_OF_TODAY) || date.isBefore(moment(JAN_FIRST_2022))
}

const DateTimePicker = ({ timestamp, setDateTime, showTime }: DateTimePicker) => (
  <DatePicker
    value={timestamp}
    onChange={(nextTimestamp) => nextTimestamp && setDateTime(nextTimestamp)}
    format={showTime ? TEXTS.datetime_format : TEXTS.date_format}
    showTime={
      showTime && {
        defaultValue: moment('00:00:00', 'HH:mm:ss'),
        format: 'HH:mm',
      }
    }
    disabledDate={(date) => isDateDisabled(date)}
  />
)

export default DateTimePicker
