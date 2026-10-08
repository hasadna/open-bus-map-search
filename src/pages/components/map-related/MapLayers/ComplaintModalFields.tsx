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
import type { CheckboxGroupProps } from 'antd/es/checkbox'
import type { Rule } from 'antd/es/form'
import type { TextAreaProps } from 'antd/es/input'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import dayjs from 'src/dayjs'
import { complaintTypeMappings } from './ComplaintModalForms'
import type { ComplaintTitleData } from './ComplaintModalTypes'

const numberOnly = /^[0-9]+$/u
const hebOnly = /^[\u0590-\u05FF\s'"()\-]+$/u
export const mobileOnly = /^05[0-689]-?[2-9][0-9]{6}$/u

export function isValidIsraeliId(value: string) {
  if (value.length !== 9 || !numberOnly.test(value)) return false
  const sum = value
    .split('')
    .map((digit, index) => Number(digit) * ((index % 2) + 1))
    .reduce((acc, n) => acc + Math.floor(n / 10) + (n % 10), 0)
  return sum % 10 === 0
}

export const createAllRules = (form: FormInstance, t: TFunction) => ({
  wait: [
    { required: true },
    {
      // eslint-disable-next-line @typescript-eslint/require-await
      validator: async (_: unknown, value?: [dayjs.Dayjs, dayjs.Dayjs]) => {
        const eventHour = form.getFieldValue('eventHour') as dayjs.Dayjs | undefined
        if (!value || !eventHour) return
        if (dayjs(eventHour).isBefore(value[0]) || dayjs(eventHour).isAfter(value[1])) {
          throw new Error(t('complaints.event_hour_between_wait'))
        }
      },
    },
  ] as Rule[],
  id: [
    { required: true },
    {
      // eslint-disable-next-line @typescript-eslint/require-await
      validator: async (_: unknown, value?: string) => {
        if (value && !isValidIsraeliId(value)) throw new Error(t('complaints.invalid_id'))
      },
    },
  ] as Rule[],
  passport: [
    { required: true },
    {
      // eslint-disable-next-line @typescript-eslint/require-await
      validator: async (_: unknown, value?: string) => {
        if (!value) return
        if (value.trim().length < 3 || value.length > 30) {
          throw new Error(t('complaints.invalid_passport'))
        }
      },
    },
  ] as Rule[],
  ravKavNumber: [
    { len: 11 },
    { pattern: numberOnly, message: t('complaints.invalid_rav_kav_number') },
  ] as Rule[],
  firstName: [
    { required: true },
    { pattern: hebOnly, message: t('complaints.only_hebrew_allowed') },
  ] as Rule[],
  lastName: [
    { required: true },
    { pattern: hebOnly, message: t('complaints.only_hebrew_allowed') },
  ] as Rule[],
  mobile: [
    { required: true },
    { pattern: mobileOnly, message: t('complaints.invalid_mobile') },
  ] as Rule[],
})

const fullWidth = { width: '100%' }

type FieldType = keyof typeof fieldComponents

export type FormFieldProps<T extends FieldType = FieldType> = {
  name: string
  type: T
  rules?: Rule[]
  props?: React.ComponentProps<(typeof fieldComponents)[T]>
  extra?: string
  pre_title?: string
}

const fieldComponents = {
  Input: (props: InputProps) => <Input {...props} style={fullWidth} />,
  TextArea: (props: TextAreaProps) => <Input.TextArea {...props} style={fullWidth} />,
  DatePicker: (props: DatePickerProps) => (
    <DatePicker
      {...props}
      style={fullWidth}
      disabledDate={(date) => date.isAfter(dayjs().startOf('day').add(1, 'day'))}
    />
  ),
  TimePicker: (props: TimePickerProps) => (
    <TimePicker {...props} style={fullWidth} format="H:mm" minuteStep={5} />
  ),
  TimeRangePicker: (props: TimeRangePickerProps) => (
    <TimePicker.RangePicker {...props} style={fullWidth} format="H:mm" minuteStep={5} />
  ),
  Checkbox: (props: CheckboxProps & { title?: string }) => (
    <Checkbox {...props}>{props.title}</Checkbox>
  ),
  CheckboxGroup: (props: CheckboxGroupProps) => <Checkbox.Group {...props} style={fullWidth} />,
  Radio: (props: RadioGroupProps) => <Radio.Group {...props} style={fullWidth} />,
  Select: (props: SelectProps) => <Select {...props} style={fullWidth} showSearch allowClear />,
} as const

export const RenderField = ({ name, props, rules, type, extra }: FormFieldProps) => {
  const { t } = useTranslation()
  const Component = fieldComponents[type]
  const labelKey = name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
  return (
    <Form.Item
      key={name}
      name={name}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      label={t(`complaints.${labelKey}` as any)}
      rules={rules}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extra={extra ? t(extra as any) : undefined}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Component {...(props as any)} name={name} />
    </Form.Item>
  )
}

const createField = (params: FormFieldProps) => params

export const allComplaintFields = {
  documentType: createField({
    name: 'documentType',
    type: 'Radio',
    rules: [{ required: true }],
  }),
  id: createField({
    name: 'id_fild',
    type: 'Input',
    props: { maxLength: 9 },
  }),
  passport: createField({
    name: 'passport_fild',
    type: 'Input',
    props: { maxLength: 30 },
  }),
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
  mobile: createField({
    name: 'mobile',
    type: 'Input',
    rules: [{ required: true }],
    props: { maxLength: 11 },
  }),
  email: createField({
    name: 'email',
    type: 'Input',
    rules: [{ type: 'email', required: true }],
  }),
  emailConfirmation: createField({
    name: 'emailConfirmation',
    type: 'Input',
    rules: [{ type: 'email', required: true }],
  }),
  complaintType: createField({
    name: 'complaintType',
    type: 'Select',
    rules: [{ required: true }],
  }),
  details: createField({
    name: 'details',
    type: 'TextArea',
    rules: [{ required: true, min: 2 }],
    props: { rows: 4, maxLength: 1500 },
  }),
  busOperator: createField({
    name: 'busOperator',
    type: 'Select',
    rules: [{ required: true }],
  }),
  licenseNumber: createField({
    name: 'licenseNumber',
    type: 'Input',
  }),
  driverName: createField({
    name: 'driverName',
    type: 'Input',
  }),
  eventDate: createField({
    name: 'eventDate',
    type: 'DatePicker',
    rules: [{ required: true }],
    pre_title: 'ביום',
  }),
  lineNumberText: createField({
    name: 'lineNumberText',
    type: 'Input',
    rules: [{ required: true }],
    props: { maxLength: 5 },
    pre_title: 'קו',
  }),
  eventHour: createField({
    name: 'eventHour',
    type: 'TimePicker',
    rules: [{ required: true }],
    props: { needConfirm: true },
    pre_title: 'בשעה',
  }),
  direction: createField({
    name: 'direction',
    type: 'Select',
    rules: [{ required: true }],
  }),
  wait: createField({
    name: 'wait',
    type: 'TimeRangePicker',
    rules: [{ required: true }],
  }),
  raisingStation: createField({
    name: 'raisingStation',
    type: 'Select',
  }),
  ravKavNumber: createField({
    name: 'ravKavNumber',
    type: 'Input',
    props: { maxLength: 11 },
  }),
} as const

export const buildComplaintTitle = (data: ComplaintTitleData): string => {
  const { complaintType, eventDate, eventHour, lineNumberText } = data
  const applyTypeText = complaintTypeMappings[complaintType]?.subject?.applyType?.dataText || ''
  const titleParts = [applyTypeText]
  for (const fieldName of complaintTypeMappings[complaintType]?.title_order || []) {
    let value: string | undefined
    if (fieldName === 'eventDate') value = eventDate?.format('DD/MM/YYYY')
    if (fieldName === 'eventHour') value = eventHour?.format('HH:mm')
    if (fieldName === 'lineNumberText') value = lineNumberText
    if (value) titleParts.push(value)
  }
  return titleParts.join(' ')
}
