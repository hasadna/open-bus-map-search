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
} from 'antd'
import type { Rule } from 'antd/es/form'
import type { TextAreaProps } from 'antd/es/input'
import dayjs from 'dayjs'

// --- Validators ---
const hebOnly = /^[א-ת,\s,',"]+$/u
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
const commonStyle = { width: '100%' }

const fieldComponents = {
  Input: (props: InputProps) => <Input {...props} style={commonStyle} />,
  TextArea: (props: TextAreaProps) => <Input.TextArea {...props} style={commonStyle} />,
  DatePicker: (props: DatePickerProps) => <DatePicker {...props} style={commonStyle} />,
  TimePicker: (props: TimePickerProps) => (
    <TimePicker {...props} style={commonStyle} format="HH:mm" />
  ),
  Checkbox: (props: CheckboxProps & { title?: string }) => (
    <Checkbox {...props}>{props.title}</Checkbox>
  ),
  Select: (props: SelectProps) => <Select {...props} style={commonStyle} />,
} as const

type FieldType = keyof typeof fieldComponents

type FormFieldProps<T extends FieldType = FieldType> = {
  name: string
  type: T
  rules?: Rule[]
  props?: React.ComponentProps<(typeof fieldComponents)[T]>
}

export function renderField({ name, props, rules, type }: FormFieldProps) {
  const Component = fieldComponents[type]
  return (
    <Form.Item name={name} rules={rules}>
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
    maxLength: 2000,
  }),
  operator: createField('operator', 'Select', [{ required: true }]),
  licensePlate: createField('licensePlate', 'Input', [{ required: true }]),
  eventDate: createField('eventDate', 'DatePicker', [{ required: true }], {
    disabledDate: (d: dayjs.Dayjs) => d && d > dayjs(),
  }),
  lineNumber: createField('lineNumber', 'Input', [{ required: true }]),
  eventTime: createField('eventTime', 'TimePicker', [{ required: true }]),
  route: createField('route', 'Input', [{ required: true }]),
  waitFrom: createField('waitFrom', 'TimePicker', [{ required: true }]),
  waitTo: createField('waitTo', 'TimePicker', [{ required: true }]),
  boardingStation: createField('boardingStation', 'Select'),
  traveledFromOptional: createField('traveledFromOptional', 'Input'),
  traveledToOptional: createField('traveledToOptional', 'Input'),
  traveledFrom: createField('traveledFrom', 'Input', [{ required: true }]),
  traveledTo: createField('traveledTo', 'Input', [{ required: true }]),
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

// --- Complaint Types ---
export interface ComplaintTypeFields {
  fields: (keyof typeof allComplaintFields)[]
  auto_fields: (keyof typeof allComplaintFields)[]
}

export const complaintTypes = [
  'other',
  'no_ride',
  'no_stop',
  'delay',
  'overcrowded',
  'early',
  'add_or_remove_station',
  'add_new_line',
  'add_frequency',
  'driver_behavior',
  'cleanliness',
  'fine_appeal',
  'route_change',
  'line_switch',
  'station_signs',
  'ticketing_fares_discounts',
  // 'train_delay',
  // 'train_no_ride',
  // 'train_early',
  // 'train_driver_behavior',
  'debug',
] as const

export const complaintTypeMappings: Record<(typeof complaintTypes)[number], ComplaintTypeFields> = {
  other: { fields: [], auto_fields: [] },
  no_ride: {
    fields: [
      'eventTime',
      'waitFrom',
      'waitTo',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['operator', 'route', 'lineNumber', 'licensePlate', 'eventDate'],
  },
  no_stop: {
    fields: [
      'eventTime',
      'waitFrom',
      'waitTo',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['operator', 'route', 'lineNumber', 'licensePlate', 'eventDate'],
  },
  delay: {
    fields: [
      'eventTime',
      'waitFrom',
      'waitTo',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['operator', 'route', 'lineNumber', 'licensePlate', 'eventDate'],
  },
  overcrowded: {
    fields: [
      'eventTime',
      'waitFrom',
      'waitTo',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['operator', 'route', 'lineNumber', 'licensePlate', 'eventDate'],
  },
  early: {
    fields: [
      'eventTime',
      'waitFrom',
      'waitTo',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['operator', 'route', 'lineNumber', 'licensePlate', 'eventDate'],
  },
  add_or_remove_station: {
    fields: [
      'addRemoveStationReason',
      'boardingStation',
      'requestedStationAddress',
      'traveledFrom',
      'traveledTo',
    ],
    auto_fields: ['operator', 'lineActiveDate', 'lineNumber'],
  },
  add_new_line: {
    fields: ['route'],
    auto_fields: [],
  },
  add_frequency: {
    fields: [
      'addFrequencyReason',
      'operator',
      'eventDate',
      'eventTime',
      'waitFrom',
      'waitTo',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['lineNumber', 'route'],
  },
  driver_behavior: {
    fields: [
      'operator',
      'eventDate',
      'eventTime',
      'waitFrom',
      'waitTo',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
      'willingToTestifyMOT',
      'willingToTestifyCourt',
    ],
    auto_fields: ['licensePlate', 'lineNumber', 'route'],
  },
  cleanliness: {
    fields: [
      'operator',
      'eventDate',
      'eventTime',
      'traveledFromOptional',
      'traveledToOptional',
      'boardingStation',
    ],
    auto_fields: ['licensePlate', 'lineNumber', 'route'],
  },
  fine_appeal: {
    fields: [
      'ravKavNumber',
      'operator',
      'eventDate',
      'eventTime',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['lineNumber', 'route'],
  },
  route_change: {
    fields: ['operator', 'eventDate', 'traveledFrom', 'traveledTo'],
    auto_fields: ['lineNumber', 'route'],
  },
  line_switch: { fields: ['traveledFromOptional', 'traveledToOptional'], auto_fields: [] },
  station_signs: {
    fields: [
      'operator',
      'eventDate',
      'eventTime',
      'boardingLocality',
      'stationCatNum',
      'lineNumber',
    ],
    auto_fields: [],
  },
  ticketing_fares_discounts: { fields: ['ravKavNumber'], auto_fields: [] },
  // train_delay: { fields: ['trainType'], auto_fields: ['trainNumber'] },
  // train_no_ride: { fields: ['eventDate'], auto_fields: [] },
  // train_early: { fields: ['eventTime'], auto_fields: [] },
  // train_driver_behavior: { fields: ['originStation', 'destinationStation', 'description'] auto_fields: [] },
  debug: {
    fields: Object.keys(allComplaintFields).filter(
      (key) =>
        ![
          'firstName',
          'lastName',
          'id',
          'email',
          'phone',
          'description',
          'lineNumber',
          'route',
          'licensePlate',
        ].includes(key),
    ) as (keyof typeof allComplaintFields)[],
    auto_fields: ['operator', 'lineNumber', 'route', 'licensePlate'],
  },
} as const

export const complaintList = complaintTypes.map((c) => ({ value: c, label: c }))
export type ComplaintTypes = (typeof complaintTypes)[number]
