import { allComplaintFields } from './ComplaintModalFields'

export interface ComplaintTypeFields {
  allFields: (keyof typeof allComplaintFields)[]
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
  other: { allFields: [] },
  no_ride: {
    allFields: [
      'eventTime',
      'wait',
      'route',
      'boardingStation',
      'busDirectionFrom',
      'busDirectionTo',
      'operator',
      'lineNumber',
      'licensePlate',
      'eventDate',
    ],
  },
  no_stop: {
    allFields: [
      'eventTime',
      'wait',
      'route',
      'boardingStation',
      'busDirectionFrom',
      'busDirectionTo',
      'operator',
      'lineNumber',
      'licensePlate',
      'eventDate',
    ],
  },
  delay: {
    allFields: [
      'eventTime',
      'wait',
      'route',
      'boardingStation',
      'busDirectionFrom',
      'busDirectionTo',
      'operator',
      'lineNumber',
      'licensePlate',
      'eventDate',
    ],
  },
  overcrowded: {
    allFields: [
      'eventTime',
      'wait',
      'route',
      'boardingStation',
      'busDirectionFrom',
      'busDirectionTo',
      'operator',
      'lineNumber',
      'licensePlate',
      'eventDate',
    ],
  },
  early: {
    allFields: [
      'eventTime',
      'wait',
      'route',
      'boardingStation',
      'busDirectionFrom',
      'busDirectionTo',
      'operator',
      'lineNumber',
      'licensePlate',
      'eventDate',
    ],
  },
  add_or_remove_station: {
    allFields: [
      'addRemoveStationReason',
      'boardingStation',
      'requestedStationAddress',
      'busDirectionFrom',
      'busDirectionTo',
      'operator',
      'lineActiveDate',
      'lineNumber',
    ],
  },
  add_new_line: { allFields: ['route'] },
  add_frequency: {
    allFields: [
      'addFrequencyReason',
      'eventTime',
      'wait',
      'boardingStation',
      'busDirectionFrom',
      'busDirectionTo',
      'eventDate',
      'operator',
      'lineNumber',
      'route',
    ],
  },
  driver_behavior: {
    allFields: [
      'eventTime',
      'wait',
      'boardingStation',
      'busDirectionFrom',
      'busDirectionTo',
      'willingToTestifyMOT',
      'willingToTestifyCourt',
      'operator',
      'eventDate',
      'licensePlate',
      'lineNumber',
      'route',
    ],
  },
  cleanliness: {
    allFields: [
      'eventTime',
      'busDirectionFrom',
      'busDirectionTo',
      'boardingStation',
      'operator',
      'eventDate',
      'licensePlate',
      'lineNumber',
      'route',
    ],
  },
  fine_appeal: {
    allFields: [
      'ravKavNumber',
      'operator',
      'eventDate',
      'eventTime',
      'boardingStation',
      'busDirectionFrom',
      'busDirectionTo',
      'lineNumber',
      'route',
    ],
  },
  route_change: {
    allFields: [
      'operator',
      'eventDate',
      'busDirectionFrom',
      'busDirectionTo',
      'lineNumber',
      'route',
    ],
  },
  line_switch: { allFields: ['busDirectionFrom', 'busDirectionTo'] },
  station_signs: {
    allFields: [
      'operator',
      'eventDate',
      'eventTime',
      'boardingLocality',
      'stationCatNum',
      'lineNumber',
    ],
  },
  ticketing_fares_discounts: { allFields: ['ravKavNumber'] },
  debug: {
    allFields: Object.keys(allComplaintFields).filter(
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
        ].includes(key) || ['operator'].includes(key),
    ) as (keyof typeof allComplaintFields)[],
  },
} as const

export const complaintList = complaintTypes.map((c) => ({ value: c, label: c }))
export type ComplaintTypes = (typeof complaintTypes)[number]
