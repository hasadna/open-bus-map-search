import { type CivilDate, civilDateToDayjs, toCivilDate } from 'src/model/time/civilDate'
import { DateSelector } from './DateSelector'

export type CivilDateSelectorProps = {
  value: CivilDate
  minDate?: CivilDate
  customLabel?: string
  disabled?: boolean
  onChange: (date: CivilDate | null) => void
}

/**
 * The single ingress/egress seam between the app's CivilDate model and the MUI
 * DatePicker (which speaks Dayjs). Ingress materializes the day via the noon-anchored
 * civilDateToDayjs (rollback-immune — noon never crosses midnight in any zone); egress
 * reads the picked Dayjs back with toCivilDate. Pages hold a CivilDate and never touch
 * the conversion, so the Israel-midnight footgun can't reappear at a call site.
 */
export function CivilDateSelector({ value, minDate, onChange, ...rest }: CivilDateSelectorProps) {
  return (
    <DateSelector
      time={civilDateToDayjs(value)}
      minDate={minDate ? civilDateToDayjs(minDate) : undefined}
      onChange={(picked) => onChange(picked ? toCivilDate(picked) : null)}
      {...rest}
    />
  )
}
