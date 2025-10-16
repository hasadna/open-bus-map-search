import { Checkbox, DatePicker, Form, Input, Select, TimePicker } from 'antd'
import type { InputProps, SelectProps } from 'antd'
import type { CheckboxProps } from 'antd/es/checkbox'
import type { DatePickerProps } from 'antd/es/date-picker'
import { Rule } from 'antd/es/form'
import type { TextAreaProps } from 'antd/es/input'
import type { TimePickerProps } from 'antd/es/time-picker'
import dayjs from 'src/dayjs'

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

export const renderField = (fieldConfig: FormFieldSetting, defaultValue?: string) => {
  let component

  switch (fieldConfig.component) {
    case 'Select':
      component = (
        <Select {...fieldConfig.props} style={{ width: '100%' }} defaultValue={defaultValue} />
      )
      break
    case 'TextArea':
      component = <Input.TextArea {...fieldConfig.props} defaultValue={defaultValue} />
      break
    case 'DatePicker':
      component = <DatePicker {...fieldConfig.props} style={{ width: '100%' }} />
      break
    case 'TimePicker':
      component = <TimePicker {...fieldConfig.props} format="HH:mm" style={{ width: '100%' }} />
      break
    case 'Checkbox':
      return (
        <Form.Item
          key={fieldConfig.name}
          name={fieldConfig.name}
          valuePropName="checked"
          rules={fieldConfig.rules}>
          <Checkbox {...fieldConfig.props}>{fieldConfig.labelKey}</Checkbox>
        </Form.Item>
      )
    default:
      component = <Input {...fieldConfig.props} defaultValue={defaultValue} />
  }

  return (
    <Form.Item
      key={fieldConfig.name}
      name={fieldConfig.name}
      label={fieldConfig.labelKey}
      rules={fieldConfig.rules}>
      {component}
    </Form.Item>
  )
}

export const allComplaintFields = {
  // --- Personal Details ---
  firstName: {
    name: 'firstName',
    labelKey: 'first_name',
    component: 'Input',
    rules: [{ required: true, pattern: /[א-ת]+/u }],
    props: { maxLength: 25 },
  } as FormFieldSetting,
  lastName: {
    name: 'lastName',
    labelKey: 'last_name',
    component: 'Input',
    rules: [{ required: true, pattern: /[א-ת]+/u }],
    props: { maxLength: 25 },
  } as FormFieldSetting,
  id: {
    name: 'id',
    labelKey: 'id',
    component: 'Input',
    rules: [
      { required: true, len: 9 },
      {
        validator: (_, value: string) => {
          if (!value || value.length !== 9 || !/^\d+$/.test(value))
            return Promise.reject(new Error('Invalid ID'))
          let sum = 0
          for (let i = 0; i < value.length; i++) {
            const n = Number(value[i]) * ((i % 2) + 1)
            sum += Math.floor(n / 10) + (n % 10)
          }
          return sum % 10 === 0 ? Promise.resolve() : Promise.reject(new Error('Invalid ID number'))
        },
      },
    ],
    props: { maxLength: 9 },
  } as FormFieldSetting,
  email: {
    name: 'email',
    labelKey: 'email',
    component: 'Input',
    rules: [{ type: 'email', required: true }],
  } as FormFieldSetting,
  phone: {
    name: 'phone',
    labelKey: 'phone',
    component: 'Input',
    rules: [{ required: true }],
    props: { maxLength: 11 },
  } as FormFieldSetting,
  description: {
    name: 'description',
    labelKey: 'description',
    component: 'TextArea',
    rules: [{ required: true, min: 2 }],
    props: { rows: 4, maxLength: 2000 },
  } as FormFieldSetting,
  // --- Dynamic Fields ---
  busCompany: {
    name: 'busCompany',
    labelKey: 'bus_company_operator',
    component: 'Input',
    rules: [{ required: true }],
  } as FormFieldSetting,
  licensePlate: {
    name: 'licensePlate',
    labelKey: 'license_plate',
    component: 'Input',
    rules: [{ required: true }],
  } as FormFieldSetting,
  eventDate: {
    name: 'eventDate',
    labelKey: 'event_date',
    component: 'DatePicker',
    rules: [{ required: true }],
    props: { style: { width: '100%' }, maxDate: dayjs() },
  } as FormFieldSetting,
  lineNumber: {
    name: 'lineNumber',
    labelKey: 'line_number',
    component: 'Input',
    rules: [{ required: true }],
  } as FormFieldSetting,
  eventTime: {
    name: 'eventTime',
    labelKey: 'event_time',
    component: 'TimePicker',
    rules: [{ required: true }],
  } as FormFieldSetting,
  route: {
    name: 'route',
    labelKey: 'origin_destination_route',
    component: 'Input',
    rules: [{ required: true }],
  } as FormFieldSetting,
  waitFrom: {
    name: 'waitFrom',
    labelKey: 'wait_from_time',
    component: 'TimePicker',
    rules: [{ required: true }],
  } as FormFieldSetting,
  waitTo: {
    name: 'waitTo',
    labelKey: 'wait_to_time',
    component: 'TimePicker',
    rules: [{ required: true }],
  } as FormFieldSetting,
  boardingStation: {
    name: 'boardingStation',
    labelKey: 'boarding_station_optional',
    component: 'Input',
    rules: [],
  } as FormFieldSetting,
  traveledFromOptional: {
    name: 'traveledFromOptional',
    labelKey: 'traveled_from_optional',
    component: 'Input',
    rules: [],
  } as FormFieldSetting,
  traveledToOptional: {
    name: 'traveledToOptional',
    labelKey: 'traveled_to_optional',
    component: 'Input',
    rules: [],
  } as FormFieldSetting,
  traveledFrom: {
    name: 'traveledFrom',
    labelKey: 'traveled_from',
    component: 'Input',
    rules: [{ required: true }],
  } as FormFieldSetting,
  traveledTo: {
    name: 'traveledTo',
    labelKey: 'traveled_to',
    component: 'Input',
    rules: [{ required: true }],
  } as FormFieldSetting,
  lineActiveDate: {
    name: 'lineActiveDate',
    labelKey: 'line_active_date',
    component: 'Input',
    rules: [{ required: true }],
  } as FormFieldSetting,
  addRemoveStationReason: {
    name: 'addRemoveStationReason',
    labelKey: 'add_remove_station',
    component: 'Input',
    rules: [{ required: true }],
  } as FormFieldSetting,
  requestedStationAddress: {
    name: 'requestedStationAddress',
    labelKey: 'requested_station_address',
    component: 'Input',
    rules: [{ required: true }],
  } as FormFieldSetting,
  boardingLocality: {
    name: 'boardingLocality',
    labelKey: 'boarding_locality',
    component: 'Input',
    rules: [{ required: true }],
  } as FormFieldSetting,
  destinationLocality: {
    name: 'destinationLocality',
    labelKey: 'destination_locality',
    component: 'Input',
    rules: [{ required: true }],
  } as FormFieldSetting,
  addFrequencyReason: {
    name: 'addFrequencyReason',
    labelKey: 'add_frequency_reason',
    component: 'Input',
    rules: [{ required: true }],
  } as FormFieldSetting,
  willingToTestifyMOT: {
    name: 'willingToTestifyMOT',
    labelKey: 'willing_to_testify_mot',
    component: 'Checkbox',
    rules: [],
  } as FormFieldSetting,
  willingToTestifyCourt: {
    name: 'willingToTestifyCourt',
    labelKey: 'willing_to_testify_court',
    component: 'Checkbox',
    rules: [],
  } as FormFieldSetting,
  ravKavNumber: {
    name: 'ravKavNumber',
    labelKey: 'rav_kav_number',
    component: 'Input',
    rules: [
      {
        required: true,
        min: 11,
        validator: (_, value: string) => {
          return /^\d+$/.test(value)
            ? Promise.resolve()
            : Promise.reject(new Error('Invalid Rav Kav number'))
        },
      },
    ],
    props: { maxLength: 11 },
  } as FormFieldSetting,
  stationCatNum: {
    name: 'stationCatNum',
    labelKey: 'station_catalog_number',
    component: 'Input',
    rules: [{ required: true }],
  },
  // New fields for train complaints
  trainType: {
    name: 'trainType',
    labelKey: 'train_type',
    component: 'Input',
    rules: [{ required: true }],
  },
  trainNumber: {
    name: 'trainNumber',
    labelKey: 'train_number',
    component: 'Input',
    rules: [{ required: true }],
  },
  originStation: {
    name: 'originStation',
    labelKey: 'origin_station',
    component: 'Input',
    rules: [{ required: true }],
  },
  destinationStation: {
    name: 'destinationStation',
    labelKey: 'destination_station',
    component: 'Input',
    rules: [{ required: true }],
  },
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
  'train_delay',
  'train_no_ride',
  'train_early',
  'train_driver_behavior',
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
  add_new_line: {
    fields: ['boardingLocality', 'destinationLocality'],
    auto_fields: [],
  },
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
  line_switch: {
    fields: ['traveledFromOptional', 'traveledToOptional'],
    auto_fields: [],
  },
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
  ticketing_fares_discounts: {
    fields: ['ravKavNumber'],
    auto_fields: [],
  },
  train_delay: {
    fields: ['trainType'],
    auto_fields: ['trainNumber'],
  },
  train_no_ride: {
    fields: ['eventDate'],
    auto_fields: [],
  },
  train_early: {
    fields: ['eventTime'],
    auto_fields: [],
  },
  train_driver_behavior: {
    fields: ['originStation', 'destinationStation', 'description'],
    auto_fields: [],
  },
  debug: {
    fields: (Object.keys(allComplaintFields) as (keyof typeof allComplaintFields)[]).filter(
      (key) =>
        ![
          // Static Fileds
          'firstName',
          'lastName',
          'id',
          'email',
          'phone',
          'description',
          // Auto Complited Fileds
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
