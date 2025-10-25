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
import type { Rule } from 'antd/es/form'
import type { TextAreaProps } from 'antd/es/input'
import dayjs from 'dayjs'
import { useBusOperatorQuery, useGovTimeQuery } from 'src/hooks/useFormQuerys'

// --- Validators ---
const hebOnly = /^(?![-'"\s()]*$)([א-ת-'"\s()]*)\s*$/u
const numberOnly = /^\d+$/

const createIdValidator = (): Rule => ({
  validator: async (_, value: string) => {
    if (!value || value.length !== 9 || !numberOnly.test(value)) throw new Error('Invalid ID')
    const sum = value
      .split('')
      .map((digit, i) => Number(digit) * ((i % 2) + 1))
      .reduce((acc, n) => acc + Math.floor(n / 10) + (n % 10), 0)
    if (sum % 10 !== 0) throw new Error('Invalid ID number')
    return Promise.resolve()
  },
})

const createRavKavValidator = (): Rule => ({
  validator: async (_, value: string) => {
    if (!numberOnly.test(value)) throw new Error('Invalid Rav Kav number')
    return Promise.resolve()
  },
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
        value={dayjs(props.value)}
        style={fullWidth}
        disabledDate={(d) => d.isAfter(dayjs(data))}
      />
    )
  },
  TimePicker: (props: TimePickerProps) => (
    <TimePicker {...props} style={fullWidth} format="HH:mm" />
  ),
  TimeRangePicker: (props: TimeRangePickerProps) => {
    return <TimePicker.RangePicker {...props} style={fullWidth} format="HH:mm" />
  },
  Checkbox: (props: CheckboxProps & { title?: string }) => (
    <Checkbox {...props}>{props.title}</Checkbox>
  ),
  Select: (props: SelectProps) => <Select {...props} style={fullWidth} />,
  BusOpreatorSelector: (props: SelectProps) => {
    const { data, isLoading } = useBusOperatorQuery()
    return (
      <Select
        {...props}
        options={props.options || data}
        disabled={props.disabled || isLoading}
        style={fullWidth}
      />
    )
  },
} as const

type FieldType = keyof typeof fieldComponents

export type FormFieldProps<T extends FieldType = FieldType> = {
  name: string
  type: T
  rules?: Rule[]
  initialValue?: any
  props?: React.ComponentProps<(typeof fieldComponents)[T]>
}

export function renderField({ name, initialValue, props, rules, type }: FormFieldProps) {
  const Component = fieldComponents[type]
  return (
    <Form.Item key={name} name={name} label={name} rules={rules} initialValue={initialValue}>
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
  firstName: createField('firstName', 'Input', [{ required: true, pattern: hebOnly }], {
    maxLength: 25,
  }),
  lastName: createField('lastName', 'Input', [{ required: true, pattern: hebOnly }], {
    maxLength: 25,
  }),
  id: createField('id', 'Input', [{ required: true, len: 9 }, createIdValidator()], {
    maxLength: 9,
  }),
  email: createField('email', 'Input', [{ type: 'email', required: true }]),
  phone: createField('phone', 'Input', [{ required: true }], { maxLength: 11 }),
  description: createField('description', 'TextArea', [{ required: true, min: 2 }], {
    rows: 4,
    maxLength: 1500,
  }),
  operator: createField('operator', 'BusOpreatorSelector', [{ required: true }]),
  licensePlate: createField('licensePlate', 'Input', [{ required: true }]),
  eventDate: createField('eventDate', 'DatePicker', [{ required: true }]),
  lineNumber: createField('lineNumber', 'Input', [{ required: true }], { maxLength: 5 }),
  eventTime: createField('time', 'TimePicker', [{ required: true }]),
  route: createField('route', 'Select', [{ required: true }]),
  wait: createField('wait', 'TimeRangePicker', [{ required: true }]),
  boardingStation: createField('boardingStation', 'Select'),
  // busDirectionFromOptional: createField('busDirectionFromOptional', 'Input'),
  // busDirectionToOptional: createField('busDirectionToOptional', 'Input'),
  busDirectionFrom: createField('busDirectionFrom', 'Input', [{ required: true }]),
  busDirectionTo: createField('busDirectionTo', 'Input', [{ required: true }]),
  lineActiveDate: createField('lineActiveDate', 'Input', [{ required: true }]),
  addRemoveStationReason: createField('addRemoveStationReason', 'Input', [{ required: true }]),
  requestedStationAddress: createField('requestedStationAddress', 'Input', [{ required: true }]),
  boardingLocality: createField('boardingLocality', 'Input', [{ required: true }]),
  destinationLocality: createField('destinationLocality', 'Input', [{ required: true }]),
  addFrequencyReason: createField('addFrequencyReason', 'Input', [{ required: true }]),
  willingToTestifyMOT: createField('willingToTestifyMOT', 'Checkbox'),
  willingToTestifyCourt: createField('willingToTestifyCourt', 'Checkbox'),
  ravKavNumber: createField(
    'ravKavNumber',
    'Input',
    [{ required: true, min: 11 }, createRavKavValidator()],
    { maxLength: 11 },
  ),
  stationCatNum: createField('stationCatNum', 'Input', [{ required: true }]),
} as const
