import dayjs from 'src/pages/components/utils/dayjs'

export type DataAndTimeSelectorProps = {
  time: dayjs.Dayjs
  onChange: (timeValid: dayjs.Dayjs | null) => void
  customLabel?: string
  minDate?: dayjs.Dayjs
}
