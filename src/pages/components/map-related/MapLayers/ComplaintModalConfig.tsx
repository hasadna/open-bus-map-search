import { Checkbox, DatePicker, Form, Input, Select, TimePicker } from 'antd'
import type { InputProps, SelectProps } from 'antd'
import type { CheckboxProps } from 'antd/es/checkbox'
import type { DatePickerProps } from 'antd/es/date-picker'
import { Rule } from 'antd/es/form'
import type { TextAreaProps } from 'antd/es/input'
import type { TimePickerProps } from 'antd/es/time-picker'
import dayjs from 'src/dayjs'

// --- Utilities & validators ---
const hebOnly = /^[א-ת,\s,',"]+$/u
const numberOnly = /^\d+$/

const idValidator: Rule = {
  validator: async (_: any, value: string) => {
    if (!value || value.length !== 9 || !numberOnly.test(value)) throw new Error('Invalid ID')
    let sum = 0
    for (let i = 0; i < value.length; i++) {
      const n = Number(value[i]) * ((i % 2) + 1)
      sum += Math.floor(n / 10) + (n % 10)
    }
    if (sum % 10 !== 0) throw new Error('Invalid ID number')
    return Promise.resolve()
  },
}

const ravKavValidator: Rule = {
  validator: async (_: any, value: string) => {
    if (!numberOnly.test(value)) throw new Error('Invalid Rav Kav number')
    return Promise.resolve()
  },
}

// --- Types ---
export type FormFieldSetting = {
  name: string
  labelKey: string
  rules?: Rule[]
} & (
  | { component: 'Input'; props?: InputProps }
  | { component: 'TextArea'; props?: TextAreaProps }
  | { component: 'DatePicker'; props?: DatePickerProps }
  | { component: 'TimePicker'; props?: TimePickerProps }
  | { component: 'Checkbox'; props?: CheckboxProps }
  | { component: 'Select'; props?: SelectProps<string> }
)

// --- Field factory helpers ---
const input = (name: string, labelKey: string, opts?: Partial<FormFieldSetting>) =>
  ({
    name,
    labelKey,
    component: 'Input',
    ...opts,
  }) as FormFieldSetting

const textArea = (name: string, labelKey: string, opts?: Partial<FormFieldSetting>) =>
  ({
    name,
    labelKey,
    component: 'TextArea',
    ...opts,
  }) as FormFieldSetting

const datePicker = (name: string, labelKey: string, opts?: Partial<FormFieldSetting>) =>
  ({
    name,
    labelKey,
    component: 'DatePicker',
    ...opts,
  }) as FormFieldSetting

const timePicker = (name: string, labelKey: string, opts?: Partial<FormFieldSetting>) =>
  ({
    name,
    labelKey,
    component: 'TimePicker',
    ...opts,
  }) as FormFieldSetting

const checkbox = (name: string, labelKey: string, opts?: Partial<FormFieldSetting>) =>
  ({
    name,
    labelKey,
    component: 'Checkbox',
    ...opts,
  }) as FormFieldSetting

const select = (name: string, labelKey: string, opts?: Partial<FormFieldSetting>) =>
  ({
    name,
    labelKey,
    component: 'Select',
    ...opts,
  }) as FormFieldSetting

// --- Renderer ---
export const renderField = (fieldConfig: FormFieldSetting, defaultValue?: string) => {
  const commonStyle = { width: '100%' }
  switch (fieldConfig.component) {
    case 'Select':
      return (
        <Form.Item
          key={fieldConfig.name}
          name={fieldConfig.name}
          label={fieldConfig.labelKey}
          rules={fieldConfig.rules}>
          <Select {...fieldConfig.props} style={commonStyle} defaultValue={defaultValue} />
        </Form.Item>
      )
    case 'TextArea':
      return (
        <Form.Item
          key={fieldConfig.name}
          name={fieldConfig.name}
          label={fieldConfig.labelKey}
          rules={fieldConfig.rules}>
          <Input.TextArea {...(fieldConfig.props as TextAreaProps)} defaultValue={defaultValue} />
        </Form.Item>
      )
    case 'DatePicker':
      return (
        <Form.Item
          key={fieldConfig.name}
          name={fieldConfig.name}
          label={fieldConfig.labelKey}
          rules={fieldConfig.rules}>
          <DatePicker {...(fieldConfig.props as DatePickerProps)} style={commonStyle} />
        </Form.Item>
      )
    case 'TimePicker':
      return (
        <Form.Item
          key={fieldConfig.name}
          name={fieldConfig.name}
          label={fieldConfig.labelKey}
          rules={fieldConfig.rules}>
          <TimePicker
            {...(fieldConfig.props as TimePickerProps)}
            format="HH:mm"
            style={commonStyle}
          />
        </Form.Item>
      )
    case 'Checkbox':
      // Checkbox uses valuePropName
      return (
        <Form.Item
          key={fieldConfig.name}
          name={fieldConfig.name}
          valuePropName="checked"
          rules={fieldConfig.rules}>
          <Checkbox {...(fieldConfig.props as CheckboxProps)}>{fieldConfig.labelKey}</Checkbox>
        </Form.Item>
      )
    default:
      return (
        <Form.Item
          key={fieldConfig.name}
          name={fieldConfig.name}
          label={fieldConfig.labelKey}
          rules={fieldConfig.rules}>
          <Input {...(fieldConfig.props as InputProps)} defaultValue={defaultValue} />
        </Form.Item>
      )
  }
}

// --- Field definitions ---
export const allComplaintFields = {
  // Personal
  firstName: input('firstName', 'first_name', {
    rules: [{ required: true, pattern: hebOnly }],
    props: { maxLength: 25 },
  }),
  lastName: input('lastName', 'last_name', {
    rules: [{ required: true, pattern: hebOnly }],
    props: { maxLength: 25 },
  }),
  id: input('id', 'id', {
    rules: [{ required: true, len: 9 }, idValidator],
    props: { maxLength: 9 },
  }),
  email: input('email', 'email', { rules: [{ type: 'email', required: true }] }),
  phone: input('phone', 'phone', { rules: [{ required: true }], props: { maxLength: 11 } }),
  description: textArea('description', 'description', {
    rules: [{ required: true, min: 2 }],
    props: { rows: 4, maxLength: 2000 },
  }),

  // Dynamic
  busCompany: select('busCompany', 'bus_company_operator', { rules: [{ required: true }] }),
  licensePlate: input('licensePlate', 'license_plate', { rules: [{ required: true }] }),
  eventDate: datePicker('eventDate', 'event_date', {
    rules: [{ required: true }],
    props: { style: { width: '100%' }, maxDate: dayjs() },
  }),
  lineNumber: input('lineNumber', 'line_number', { rules: [{ required: true }] }),
  eventTime: timePicker('eventTime', 'event_time', { rules: [{ required: true }] }),
  route: input('route', 'origin_destination_route', { rules: [{ required: true }] }),
  waitFrom: timePicker('waitFrom', 'wait_from_time', { rules: [{ required: true }] }),
  waitTo: timePicker('waitTo', 'wait_to_time', { rules: [{ required: true }] }),
  boardingStation: select('boardingStation', 'boarding_station_optional', { rules: [] }),
  traveledFromOptional: input('traveledFromOptional', 'traveled_from_optional', { rules: [] }),
  traveledToOptional: input('traveledToOptional', 'traveled_to_optional', { rules: [] }),
  traveledFrom: select('traveledFrom', 'traveled_from', { rules: [{ required: true }] }),
  traveledTo: select('traveledTo', 'traveled_to', { rules: [{ required: true }] }),
  lineActiveDate: input('lineActiveDate', 'line_active_date', { rules: [{ required: true }] }),
  addRemoveStationReason: input('addRemoveStationReason', 'add_remove_station', {
    rules: [{ required: true }],
  }),
  requestedStationAddress: input('requestedStationAddress', 'requested_station_address', {
    rules: [{ required: true }],
  }),
  boardingLocality: input('boardingLocality', 'boarding_locality', { rules: [{ required: true }] }),
  destinationLocality: input('destinationLocality', 'destination_locality', {
    rules: [{ required: true }],
  }),
  addFrequencyReason: input('addFrequencyReason', 'add_frequency_reason', {
    rules: [{ required: true }],
  }),
  willingToTestifyMOT: checkbox('willingToTestifyMOT', 'willing_to_testify_mot'),
  willingToTestifyCourt: checkbox('willingToTestifyCourt', 'willing_to_testify_court'),
  ravKavNumber: input('ravKavNumber', 'rav_kav_number', {
    rules: [{ required: true, min: 11 }, ravKavValidator],
    props: { maxLength: 11 },
  }),
  stationCatNum: input('stationCatNum', 'station_catalog_number', { rules: [{ required: true }] }),
  // Train
  trainType: select('trainType', 'train_type', { rules: [{ required: true }] }),
  trainNumber: input('trainNumber', 'train_number', { rules: [{ required: true }] }),
  originStation: select('originStation', 'origin_station', { rules: [{ required: true }] }),
  destinationStation: select('destinationStation', 'destination_station', {
    rules: [{ required: true }],
  }),
} as const

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
  no_ride: { fields: ['busCompany'], auto_fields: ['licensePlate'] },
  no_stop: { fields: ['eventDate'], auto_fields: ['lineNumber'] },
  delay: { fields: ['eventTime'], auto_fields: ['route'] },
  overcrowded: { fields: ['waitFrom'], auto_fields: [] },
  early: { fields: ['waitTo'], auto_fields: [] },
  add_or_remove_station: {
    fields: [
      'busCompany',
      'lineActiveDate',
      'addRemoveStationReason',
      'requestedStationAddress',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['lineNumber', 'route'],
  },
  add_new_line: { fields: ['boardingLocality', 'destinationLocality'], auto_fields: [] },
  add_frequency: {
    fields: [
      'addFrequencyReason',
      'busCompany',
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
      'busCompany',
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
      'busCompany',
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
      'busCompany',
      'eventDate',
      'eventTime',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['lineNumber', 'route'],
  },
  route_change: {
    fields: ['busCompany', 'eventDate', 'traveledFrom', 'traveledTo'],
    auto_fields: ['lineNumber', 'route'],
  },
  line_switch: { fields: ['traveledFromOptional', 'traveledToOptional'], auto_fields: [] },
  station_signs: {
    fields: [
      'busCompany',
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
    fields: (Object.keys(allComplaintFields) as (keyof typeof allComplaintFields)[]).filter(
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
          'trainNumber',
        ].includes(key),
    ),
    auto_fields: ['lineNumber', 'route', 'licensePlate', 'trainNumber'],
  },
} as const

export const complaintList = complaintTypes.map((c) => ({ value: c, label: c }))
export type ComplaintTypes = (typeof complaintTypes)[number]
