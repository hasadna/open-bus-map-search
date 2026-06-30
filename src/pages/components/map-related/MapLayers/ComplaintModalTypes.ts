import { GtfsRoutePydanticModel, RequestSubjectSchema } from '@hasadna/open-bus-api-client'
import type { Dayjs } from 'src/dayjs'
import type { Point } from '../map-types'

// NOTE: the date/time fields below are antd-picker *form values* (Dayjs is antd's native
// picker type), held only for the lifetime of the open modal and serialized to strings at
// submit (see buildComplaintData / buildComplaintTitle). This is the antd picker border —
// the same role Dayjs plays inside MUI's DateSelector — not a persisted at-rest model.

// --- Core Types ---
export interface ComplaintUser {
  firstName: string
  lastName: string
  iDNum: string
  email: string
  mobile: string
}

export interface ComplaintData {
  complaintType: ComplaintType
  applyContent: string
  busOperator?: number
  licenseNum?: string
  eventDate?: Dayjs
  lineNumberText?: string
  eventHour?: Dayjs
  direction?: number
  wait?: [Dayjs, Dayjs]
  raisingStation?: number
  raisingStationCity?: string
  destinationStationCity?: string
  reportdate?: Dayjs
  reportTime?: Dayjs
  busDirectionFrom?: string
  busDirectionTo?: string
  addOrRemoveStation?: '1' | '2'
  raisingStationAddress?: string
  firstDeclaration?: boolean
  secondDeclaration?: boolean
  ravKavNumber?: string
  addingFrequencyReason?: ('LoadTopics' | 'LongWaiting' | 'ExtensionHours')[]
  debug?: boolean
}

export type ComplaintFormValues = ComplaintUser & ComplaintData

// --- UI Types ---
export interface ComplaintModalProps {
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
  position: Point
  route: GtfsRoutePydanticModel
}

// --- Complaint Type System ---
export const complaintTypes = [
  'no_ride',
  'no_stop',
  'delay',
  'early',
  // only in debug
  'overcrowded',
  'add_or_remove_station',
  'add_new_line',
  'add_frequency',
  'driver_behavior', // request file upload
  'cleanliness',
  'fine_appeal',
  'route_change',
  'line_switch',
  'station_signs',
  'ticketing_fares_discounts',
  'other',
] as const

export type ComplaintType = (typeof complaintTypes)[number]

export interface ComplaintTypeData {
  fields: ComplaintField[]
  subject: RequestSubjectSchema
  subject_code: number
  title_order: ComplaintField[]
}

// --- Field Types ---
export type ComplaintField =
  | 'firstName'
  | 'lastName'
  | 'iDNum'
  | 'email'
  | 'mobile'
  | 'complaintType'
  | 'applyContent'
  | 'busOperator'
  | 'licenseNum'
  | 'eventDate'
  | 'lineNumberText'
  | 'eventHour'
  | 'direction'
  | 'wait'
  | 'raisingStation'
  | 'raisingStationCity'
  | 'destinationStationCity'
  | 'reportdate'
  | 'reportTime'
  | 'busDirectionFrom'
  | 'busDirectionTo'
  | 'addOrRemoveStation'
  | 'raisingStationAddress'
  | 'firstDeclaration'
  | 'secondDeclaration'
  | 'ravKavNumber'
  | 'addingFrequencyReason'
  | 'debug'

export interface FieldConfig {
  pre_title?: string
}

export interface ComplaintTitleData {
  complaintType: ComplaintType
  eventDate?: Dayjs
  eventHour?: Dayjs
  reportdate?: Dayjs
  reportTime?: Dayjs
  lineNumberText?: string
  licenseNum?: string
}

export interface ComplaintTypeMapping {
  subject: { applyType?: { dataText?: string | null } }
  title_order: ComplaintField[]
}
