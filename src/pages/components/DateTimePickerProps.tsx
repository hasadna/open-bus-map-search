import moment, { Moment } from 'moment'
import React from 'react'
import { DatePicker } from 'antd'
import { TEXTS } from 'src/resources/texts'

type DateTimePickerProps = {
  dateTime: Moment | undefined
  setDateTime: (dateTime: Moment | undefined) => void
}

export const DateTimePicker = ({ dateTime, setDateTime }: DateTimePickerProps) => (
  <DatePicker
    value={dateTime}
    onChange={(moment) => setDateTime(moment || undefined)}
    format={TEXTS.datetime_format}
    showTime={{
      defaultValue: moment('00:00:00', 'HH:mm:ss'),
      format: 'HH:mm',
    }}
  />
)
