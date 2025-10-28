import {
  Checkbox,
  type CheckboxProps,
  DatePicker,
  type DatePickerProps,
  Form,
  type FormInstance,
  Input,
  type InputProps,
  Radio,
  type RadioGroupProps,
  Select,
  type SelectProps,
  TimePicker,
  type TimePickerProps,
  type TimeRangePickerProps,
} from 'antd'
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
    return (
      <DatePicker
        {...props}
        style={fullWidth}
        disabledDate={(d) => d.isAfter(dayjs(data).startOf('day').add(1, 'day'))}
      />
    )
  },
  TimePicker: (props: TimePickerProps) => <TimePicker {...props} style={fullWidth} format="H:mm" />,
  TimeRangePicker: (props: TimeRangePickerProps) => {
    return <TimePicker.RangePicker {...props} style={fullWidth} format="H:mm" />
  },
  Checkbox: (props: CheckboxProps & { title?: string }) => (
    <Checkbox {...props}>{props.title}</Checkbox>
  ),
  Radio: (props: RadioGroupProps) => <Radio.Group {...props} style={fullWidth} />,
  Select: (props: SelectProps) => <Select {...props} style={fullWidth} />,
} as const

type FieldType = keyof typeof fieldComponents

export type FormFieldProps<T extends FieldType = FieldType> = {
  name: string
  type: T
  rules?: Rule[]
  props?: React.ComponentProps<(typeof fieldComponents)[T]>
  extra?: string
}

export const RenderField = ({ name, props, rules, type, extra }: FormFieldProps) => {
  const { t } = useTranslation()
  const Component = fieldComponents[type]
  const labelKey = name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  return (
    <Form.Item
      key={name}
      name={name}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      label={t(labelKey as any)}
      rules={rules}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      extra={t(extra as any)}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Component {...(props as any)} name={name} />
    </Form.Item>
  )
}

const createField = (params: FormFieldProps) => params

export const allComplaintFields = {
  firstName: createField({
    name: 'firstName',
    type: 'Input',
    rules: [{ required: true }],
    props: { maxLength: 25 },
  }),
  lastName: createField({
    name: 'lastName',
    type: 'Input',
    rules: [{ required: true }],
    props: { maxLength: 25 },
  }),
  id: createField({
    name: 'id',
    type: 'Input',
    rules: [{ required: true, len: 9 }],
    props: { maxLength: 9 },
  }),
  email: createField({
    name: 'email',
    type: 'Input',
    rules: [{ type: 'email', required: true }],
  }),
  phone: createField({
    name: 'phone',
    type: 'Input',
    rules: [{ required: true }],
    props: { maxLength: 11 },
  }),
  complaintType: createField({
    name: 'complaintType',
    type: 'Select',
    rules: [{ required: true }],
  }),
  description: createField({
    name: 'description',
    type: 'TextArea',
    rules: [{ required: true, min: 2 }],
    props: { rows: 4, maxLength: 1500 },
  }),
  busOperator: createField({
    name: 'busOperator',
    type: 'Select',
    rules: [{ required: true }],
  }),
  licensePlate: createField({
    name: 'licensePlate',
    type: 'Input',
  }),
  eventDate: createField({
    name: 'eventDate',
    type: 'DatePicker',
    rules: [{ required: true }],
  }),
  lineNumber: createField({
    name: 'lineNumber',
    type: 'Input',
    rules: [{ required: true }],
    props: { maxLength: 5 },
  }),
  eventTime: createField({
    name: 'eventTime',
    type: 'TimePicker',
    rules: [{ required: true }],
    props: { needConfirm: true },
  }),
  route: createField({
    name: 'route',
    type: 'Select',
    rules: [{ required: true }],
  }),
  wait: createField({
    name: 'wait',
    type: 'TimeRangePicker',
    rules: [{ required: true }],
  }),
  boardingStation: createField({
    name: 'boardingStation',
    type: 'Select',
  }),
  cityFrom: createField({
    name: 'cityFrom',
    type: 'Select',
    rules: [{ required: true }],
    props: { showSearch: true },
  }),
  cityTo: createField({
    name: 'cityTo',
    type: 'Select',
    rules: [{ required: true }],
    props: { showSearch: true },
  }),
  ticketDate: createField({
    name: 'ticketDate',
    type: 'DatePicker',
    rules: [{ required: true }],
  }),
  ticketTime: createField({
    name: 'ticketTime',
    type: 'TimePicker',
    rules: [{ required: true }],
    props: { needConfirm: true },
  }),
  travelFrom: createField({
    name: 'travelFrom',
    type: 'Input',
    rules: [{ required: true }],
  }),
  travelTo: createField({
    name: 'travelTo',
    type: 'Input',
    rules: [{ required: true }],
  }),
  activeDate: createField({
    name: 'activeDate',
    type: 'DatePicker',
    rules: [{ required: true }],
  }),
  addOrRemoveStation: createField({
    name: 'addOrRemoveStation',
    type: 'Radio',
    rules: [{ required: true }],
  }),
  removeStation: createField({
    name: 'removeStation',
    type: 'Select',
  }),
  requestedStationAddress: createField({
    name: 'requestedStationAddress',
    type: 'Input',
  }),
  boardingAddress: createField({
    name: 'boardingAddress',
    type: 'Input',
    rules: [{ required: true }],
  }),
  addFrequencyOverCrowd: createField({
    name: 'addFrequencyOverCrowd',
    type: 'Checkbox',
    rules: [{ required: true }],
  }),
  addFrequencyLongWait: createField({
    name: 'addFrequencyLongWait',
    type: 'Checkbox',
    rules: [{ required: true }],
  }),
  addFrequencyExtendTime: createField({
    name: 'addFrequencyExtendTime',
    type: 'Checkbox',
    rules: [{ required: true }],
  }),
  willingToTestifyMot: createField({
    name: 'willingToTestifyMot',
    type: 'Checkbox',
    rules: [{ required: true }],
  }),
  willingToTestifyCourt: createField({
    name: 'willingToTestifyCourt',
    type: 'Checkbox',
    rules: [{ required: true }],
  }),
  ravKavNumber: createField({
    name: 'ravKavNumber',
    type: 'Input',
    rules: [{ required: true, min: 11 }],
    props: { maxLength: 11 },
  }),
} as const

export type ComplainteField = keyof typeof allComplaintFields
