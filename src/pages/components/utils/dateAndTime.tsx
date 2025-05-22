import dayjs from 'src/dayjs'

export type DataAndTimeSelectorProps = {
  time: dayjs.Dayjs
  onChange: (timeValid: dayjs.Dayjs | null) => void
  customLabel?: string
  minDate?: dayjs.Dayjs
}
