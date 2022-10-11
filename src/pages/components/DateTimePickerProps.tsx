import moment, { Moment } from 'moment'
import React from 'react'
import { DatePicker } from 'antd'
import { TEXTS } from 'src/resources/texts'

type DateTimePickerProps = {
  timestamp: Moment | undefined
  setDateTime: (timestamp: Moment) => void
}

export const DateTimePicker = ({ timestamp, setDateTime }: DateTimePickerProps) => (
  <DatePicker
    value={timestamp}
    onChange={(nextTimestamp) => nextTimestamp && setDateTime(nextTimestamp)}
    format={TEXTS.datetime_format}
    showTime={{
      defaultValue: moment('00:00:00', 'HH:mm:ss'),
      format: 'HH:mm',
    }}
  />
)
