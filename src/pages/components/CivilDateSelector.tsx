import { type CivilDate, civilDateToDayjs, toCivilDate } from 'src/model/time/civilDate'
import { DateSelector } from './DateSelector'

export type CivilDateSelectorProps = {
  value: CivilDate
  minDate?: CivilDate
  maxDate?: CivilDate
  customLabel?: string
  disabled?: boolean
  onChange: (date: CivilDate | null) => void
}

/**
 * The one place CivilDate meets the Dayjs-speaking MUI DatePicker. Keep it that way: pages
 * that convert at the call site are how the Israel-midnight drift got in.
 */
export function CivilDateSelector({
  value,
  minDate,
  maxDate,
  onChange,
  ...rest
}: CivilDateSelectorProps) {
  return (
    <DateSelector
      time={civilDateToDayjs(value)}
      minDate={minDate ? civilDateToDayjs(minDate) : undefined}
      maxDate={maxDate ? civilDateToDayjs(maxDate) : undefined}
      onChange={(picked) => onChange(picked ? toCivilDate(picked) : null)}
      {...rest}
    />
  )
}
