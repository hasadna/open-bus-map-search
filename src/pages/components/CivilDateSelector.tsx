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
 * The single ingress/egress seam between the app's CivilDate model and the MUI
 * DatePicker (which speaks Dayjs). Ingress materializes the day via civilDateToDayjs,
 * whose Israel zone is what the picker reads the day off — so it shows the same day for
 * a visitor in any zone; egress reads the picked Dayjs back with toCivilDate. Pages hold
 * a CivilDate and never touch the conversion, so the footgun can't reappear at a call site.
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
