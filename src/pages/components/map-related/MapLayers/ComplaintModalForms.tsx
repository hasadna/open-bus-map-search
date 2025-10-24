import { allComplaintFields } from './ComplaintModalFields'

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
      'wait',
      'route',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['operator', 'lineNumber', 'licensePlate', 'eventDate'],
  },
  no_stop: {
    fields: [
      'eventTime',
      'wait',
      'route',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['operator', 'lineNumber', 'licensePlate', 'eventDate'],
  },
  delay: {
    fields: [
      'eventTime',
      'wait',
      'route',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['operator', 'lineNumber', 'licensePlate', 'eventDate'],
  },
  overcrowded: {
    fields: [
      'eventTime',
      'wait',
      'route',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['operator', 'lineNumber', 'licensePlate', 'eventDate'],
  },
  early: {
    fields: [
      'eventTime',
      'wait',
      'route',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['operator', 'lineNumber', 'licensePlate', 'eventDate'],
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
      'eventTime',
      'wait',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
    ],
    auto_fields: ['eventDate', 'operator', 'lineNumber', 'route'],
  },
  driver_behavior: {
    fields: [
      'eventTime',
      'wait',
      'boardingStation',
      'traveledFromOptional',
      'traveledToOptional',
      'willingToTestifyMOT',
      'willingToTestifyCourt',
    ],
    auto_fields: ['operator', 'eventDate', 'licensePlate', 'lineNumber', 'route'],
  },
  cleanliness: {
    fields: ['eventTime', 'traveledFromOptional', 'traveledToOptional', 'boardingStation'],
    auto_fields: ['operator', 'eventDate', 'licensePlate', 'lineNumber', 'route'],
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
