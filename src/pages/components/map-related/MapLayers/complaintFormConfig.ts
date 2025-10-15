import { Rule } from 'antd/es/form'

// Defines the structure for a single form field's settings
export interface FormFieldSetting {
  name: string
  labelKey: string
  component: 'Input' | 'TextArea' | 'DatePicker' | 'TimePicker' | 'Select' | 'Checkbox'
  rules?: Rule[]
  props?: Record<string, any>
}
// A comprehensive registry of all possible form fields
export const allComplaintFields: Record<string, FormFieldSetting> = {
  // --- Personal Details (rendered statically) ---
  firstName: {
    name: 'firstName',
    labelKey: 'first_name',
    component: 'Input',
    rules: [{ required: true, pattern: /[א-ת]+/u }],
    props: { maxLength: 25 },
  },
  lastName: {
    name: 'lastName',
    labelKey: 'last_name',
    component: 'Input',
    rules: [{ required: true, pattern: /[א-ת]+/u }],
    props: { maxLength: 25 },
  },
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
  },
  email: {
    name: 'email',
    labelKey: 'email',
    component: 'Input',
    rules: [{ type: 'email', required: true }],
  },
  phone: {
    name: 'phone',
    labelKey: 'phone',
    component: 'Input',
    rules: [{ required: true }],
    props: { maxLength: 11 },
  },
  description: {
    name: 'description',
    labelKey: 'description',
    component: 'TextArea',
    rules: [{ required: true, min: 2 }],
    props: { rows: 4, maxLength: 2000 },
  },
  // --- Dynamic Fields ---
  busCompany: {
    name: 'busCompany',
    labelKey: 'bus_company_operator',
    component: 'Input',
    rules: [{ required: true }],
  },
  licensePlate: {
    name: 'licensePlate',
    labelKey: 'license_plate',
    component: 'Input',
    rules: [{ required: true }],
  },
  eventDate: {
    name: 'eventDate',
    labelKey: 'event_date',
    component: 'DatePicker',
    rules: [{ required: true }],
  },
  lineNumber: {
    name: 'lineNumber',
    labelKey: 'line_number',
    component: 'Input',
    rules: [{ required: true }],
  },
  eventTime: {
    name: 'eventTime',
    labelKey: 'event_time',
    component: 'TimePicker',
    rules: [{ required: true }],
  },
  route: {
    name: 'route',
    labelKey: 'origin_destination_route',
    component: 'Input',
    rules: [{ required: true }],
  },
  waitFrom: {
    name: 'waitFrom',
    labelKey: 'wait_from_time',
    component: 'TimePicker',
    rules: [{ required: true }],
  },
  waitTo: {
    name: 'waitTo',
    labelKey: 'wait_to_time',
    component: 'TimePicker',
    rules: [{ required: true }],
  },
  boardingStation: {
    name: 'boardingStation',
    labelKey: 'boarding_station_optional',
    component: 'Input',
    rules: [],
  },
  traveledFromOptional: {
    name: 'traveledFromOptional',
    labelKey: 'traveled_from_optional',
    component: 'Input',
    rules: [],
  },
  traveledToOptional: {
    name: 'traveledToOptional',
    labelKey: 'traveled_to_optional',
    component: 'Input',
    rules: [],
  },
  traveledFrom: {
    name: 'traveledFrom',
    labelKey: 'traveled_from',
    component: 'Input',
    rules: [{ required: true }],
  },
  traveledTo: {
    name: 'traveledTo',
    labelKey: 'traveled_to',
    component: 'Input',
    rules: [{ required: true }],
  },
  lineActiveDate: {
    name: 'lineActiveDate',
    labelKey: 'line_active_date',
    component: 'Input',
    rules: [{ required: true }],
  },
  addRemoveStationReason: {
    name: 'addRemoveStationReason',
    labelKey: 'add_remove_station',
    component: 'Input',
    rules: [{ required: true }],
  },
  requestedStationAddress: {
    name: 'requestedStationAddress',
    labelKey: 'requested_station_address',
    component: 'Input',
    rules: [{ required: true }],
  },
  boardingLocality: {
    name: 'boardingLocality',
    labelKey: 'boarding_locality',
    component: 'Input',
    rules: [{ required: true }],
  },
  destinationLocality: {
    name: 'destinationLocality',
    labelKey: 'destination_locality',
    component: 'Input',
    rules: [{ required: true }],
  },
  addFrequencyReason: {
    name: 'addFrequencyReason',
    labelKey: 'add_frequency_reason',
    component: 'Input',
    rules: [{ required: true }],
  },
  willingToTestifyMOT: {
    name: 'willingToTestifyMOT',
    labelKey: 'willing_to_testify_mot',
    component: 'Checkbox',
    rules: [],
  },
  willingToTestifyCourt: {
    name: 'willingToTestifyCourt',
    labelKey: 'willing_to_testify_court',
    component: 'Checkbox',
    rules: [],
  },
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
  },
  stationCatNum: {
    name: 'stationCatNum',
    labelKey: 'station_catalog_number',
    component: 'Input',
    rules: [{ required: true }],
  },
}
export interface ComplaintTypeFields {
  fields: string[]
  auto_fields: string[]
}

export const complaintTypeMappings: Record<string, ComplaintTypeFields> = {
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
    fields: Object.keys(allComplaintFields).filter(
      (key) =>
        ![
          'firstName',
          'lastName',
          'id',
          'email',
          'phone',
          'lineNumber',
          'route',
          'licensePlate',
        ].includes(key),
    ),
    auto_fields: ['lineNumber', 'route', 'licensePlate', 'trainNumber'],
  },
}
