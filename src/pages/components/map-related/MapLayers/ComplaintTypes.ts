import { GtfsRoutePydanticModel, RequestSubjectSchema } from '@hasadna/open-bus-api-client'
import { Rule } from 'antd/es/form'
import dayjs from 'dayjs'
import { Point } from 'src/pages/timeBasedMap'
import { allComplaintFields, fieldComponents } from './ComplaintModalFields'
import { complaintTypeMappings } from './ComplaintModalForms'

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
  eventDate?: dayjs.Dayjs
  lineNumberText?: string
  eventHour?: dayjs.Dayjs
  direction?: number
  wait?: [dayjs.Dayjs, dayjs.Dayjs]
  raisingStation?: number
  raisingStationCity?: string
  destinationStationCity?: string
  reportdate?: dayjs.Dayjs
  reportTime?: dayjs.Dayjs
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

export interface ComplaintModalProps {
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
  position: Point
  route: GtfsRoutePydanticModel
}

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

export type ComplaintField = keyof typeof allComplaintFields

export interface ComplaintTitleData {
  complaintType: keyof typeof complaintTypeMappings
  eventDate?: dayjs.Dayjs
  eventHour?: dayjs.Dayjs
  reportdate?: dayjs.Dayjs
  reportTime?: dayjs.Dayjs
  lineNumberText?: string
  licenseNum?: string
}

export interface ComplaintTypeMapping {
  subject: { applyType?: { dataText?: string | null } }
  title_order: ComplaintField[]
}

export interface FieldConfig {
  pre_title?: string
}

export type FieldType = keyof typeof fieldComponents

export type FormFieldProps<T extends FieldType = FieldType> = {
  name: string
  type: T
  rules?: Rule[]
  props?: React.ComponentProps<(typeof fieldComponents)[T]>
  extra?: string
  pre_title?: string
}
