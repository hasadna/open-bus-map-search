import {
  Checkbox,
  type CheckboxProps,
  DatePicker,
  type DatePickerProps,
  Form,
  Input,
  type InputProps,
  Select,
  type SelectProps,
  TimePicker,
  type TimePickerProps,
  type TimeRangePickerProps,
} from 'antd'
import type { FormInstance } from 'antd'
import type { Rule } from 'antd/es/form'
import type { TextAreaProps } from 'antd/es/input'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useGovTimeQuery } from 'src/hooks/useFormQuerys'

// --- Validators ---
const numberOnly = /^\d+$/
const hebOnly = /^(?![-'"\s()]*$)([א-ת-'"\s()]*)\s*$/u

export const createAllRules = (form: FormInstance, t: TFunction) => ({
  waitRules: [
    { required: true },
    {
      validator: async (_, value) => {
        const eventTime = form.getFieldValue('eventTime')
        if (!value || !eventTime) return
        const wait = value as [string, string]
        const eventTimeDayjs = dayjs(eventTime as dayjs.Dayjs)
        const start = dayjs(wait[0])
        const end = dayjs(wait[1])
        if (eventTimeDayjs.isBefore(start) || eventTimeDayjs.isAfter(end)) {
          throw new Error(t('event_time_between_wait'))
        }
        return Promise.resolve()
      },
    },
  ] as Rule[],
  idRules: [
    { required: true, len: 9 },
    {
      validator: async (_, value: string) => {
        if (!value || value.length !== 9 || !numberOnly.test(value))
          throw new Error(t('invalid_id'))
        const sum = value
          .split('')
          .map((digit, i) => Number(digit) * ((i % 2) + 1))
          .reduce((acc, n) => acc + Math.floor(n / 10) + (n % 10), 0)
        if (sum % 10 !== 0) throw new Error(t('invalid_id'))
        return Promise.resolve()
      },
    },
  ] as Rule[],
  ravKavRules: [
    { required: true, min: 11 },
    {
      validator: async (_, value: string) => {
        if (!numberOnly.test(value)) throw new Error(t('invalid_rav_kav_number'))
        return Promise.resolve()
      },
    },
  ] as Rule[],
  firstNameRules: [
    { required: true, pattern: hebOnly, message: t('only_hebrew_allowed') },
  ] as Rule[],
  lastNameRules: [
    { required: true, pattern: hebOnly, message: t('only_hebrew_allowed') },
  ] as Rule[],
})

// ---   Field Components ---
const fullWidth = { width: '100%' }

const fieldComponents = {
  Input: (props: InputProps) => <Input {...props} style={fullWidth} />,
  TextArea: (props: TextAreaProps) => <Input.TextArea {...props} style={fullWidth} />,
  DatePicker: (props: DatePickerProps) => {
    const { data } = useGovTimeQuery()
    return <DatePicker {...props} style={fullWidth} disabledDate={(d) => d.isAfter(dayjs(data))} />
  },
  TimePicker: (props: TimePickerProps) => <TimePicker {...props} style={fullWidth} format="H:mm" />,
  TimeRangePicker: (props: TimeRangePickerProps) => {
    return <TimePicker.RangePicker {...props} style={fullWidth} format="H:mm" />
  },
  Checkbox: (props: CheckboxProps & { title?: string }) => (
    <Checkbox {...props}>{props.title}</Checkbox>
  ),
  Select: (props: SelectProps) => <Select {...props} style={fullWidth} />,
} as const

type FieldType = keyof typeof fieldComponents

export type FormFieldProps<T extends FieldType = FieldType> = {
  name: string
  type: T
  rules?: Rule[]
  props?: React.ComponentProps<(typeof fieldComponents)[T]>
}

export const RenderField = ({ name, props, rules, type }: FormFieldProps) => {
  const { t } = useTranslation()
  const Component = fieldComponents[type]
  const labelKey = name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  return (
    <Form.Item
      key={name}
      name={name}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      label={t(labelKey as any)}
      rules={rules}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Component {...(props as any)} />
    </Form.Item>
  )
}

function createField<T extends FieldType>(
  name: string,
  type: T,
  rules?: Rule[],
  props?: React.ComponentProps<(typeof fieldComponents)[T]>,
): FormFieldProps<T> {
  return { name, type, rules, props }
}

export const allComplaintFields = {
  firstName: createField('firstName', 'Input', [{ required: true }], {
    maxLength: 25,
  }),
  lastName: createField('lastName', 'Input', [{ required: true }], {
    maxLength: 25,
  }),
  id: createField('id', 'Input', [{ required: true, len: 9 }], { maxLength: 9 }),
  email: createField('email', 'Input', [{ type: 'email', required: true }]),
  phone: createField('phone', 'Input', [{ required: true }], { maxLength: 11 }),
  complaintType: createField('complaintType', 'Select', [{ required: true }]),
  description: createField('description', 'TextArea', [{ required: true, min: 2 }], {
    rows: 4,
    maxLength: 1500,
  }),
  busOperator: createField('busOperator', 'Select', [{ required: true }]),
  licensePlate: createField('licensePlate', 'Input'),
  eventDate: createField('eventDate', 'DatePicker', [{ required: true }]),
  lineNumber: createField('lineNumber', 'Input', [{ required: true }], { maxLength: 5 }),
  eventTime: createField('eventTime', 'TimePicker', [{ required: true }], { needConfirm: true }),
  route: createField('route', 'Select', [{ required: true }]),
  wait: createField('wait', 'TimeRangePicker', [{ required: true }]),
  boardingStation: createField('boardingStation', 'Select'),
  cityFrom: createField('cityFrom', 'Select', [{ required: true }], { showSearch: true }),
  cityTo: createField('cityTo', 'Select', [{ required: true }], { showSearch: true }),
  ticketDate: createField('ticketDate', 'DatePicker', [{ required: true }]),
  ticketTime: createField('ticketTime', 'TimePicker', [{ required: true }], { needConfirm: true }),
  // travelFromOptional: createField('travelFromOptional', 'Input'),
  // travelToOptional: createField('travelToOptional', 'Input'),
  travelFrom: createField('travelFrom', 'Input', [{ required: true }]),
  travelTo: createField('travelTo', 'Input', [{ required: true }]),
  activeDate: createField('activeDate', 'DatePicker', [{ required: true }]),
  addRemoveStationReason: createField('addRemoveStationReason', 'Input', [{ required: true }]),
  requestedStationAddress: createField('requestedStationAddress', 'Input', [{ required: true }]),
  boardingAddress: createField('boardingAddress', 'Input', [{ required: true }]),
  addFrequencyOverCrowd: createField('addFrequencyOverCrowd', 'Checkbox', [{ required: true }]),
  addFrequencyLongWait: createField('addFrequencyLongWait', 'Checkbox', [{ required: true }]),
  addFrequencyExtendTime: createField('addFrequencyExtendTime', 'Checkbox', [{ required: true }]),
  willingToTestifyMot: createField('willingToTestifyMot', 'Checkbox', [{ required: true }]),
  willingToTestifyCourt: createField('willingToTestifyCourt', 'Checkbox', [{ required: true }]),
  ravKavNumber: createField('ravKavNumber', 'Input', [{ required: true, min: 11 }], {
    maxLength: 11,
  }),
  // stationCatNum: createField('stationCatNum', 'Input', [{ required: true }]),
} as const

export type ComplainteField = keyof typeof allComplaintFields
