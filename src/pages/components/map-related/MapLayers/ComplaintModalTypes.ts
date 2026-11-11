import type {
  DataCode,
  GtfsRoutePydanticModel,
} from 'D:\\WEB\\open-bus-api-client\\open-bus-api-client\\client\\src'
import type dayjs from 'dayjs'
import type { Point } from '../map-types'
import { allComplaintFields } from './ComplaintModalFields'

export type ComplaintDocumentType = 'id' | 'passport'

export interface ComplaintUser {
  documentType: ComplaintDocumentType
  id_fild: string
  passport_fild: string
  firstName: string
  lastName: string
  mobile: string
  email: string
  emailConfirmation: string
  ravKavNumber?: string
}

export interface ComplaintData {
  complaintType: ComplaintType
  details: string
  busOperator?: number
  licenseNumber?: string
  driverName?: string
  eventDate?: dayjs.Dayjs
  lineNumberText?: string
  eventHour?: dayjs.Dayjs
  direction?: number
  wait?: [dayjs.Dayjs, dayjs.Dayjs]
  raisingStation?: number
  debug?: boolean
}

export type ComplaintFormValues = Partial<ComplaintUser> & ComplaintData

export interface ComplaintModalProps {
  modalOpen?: boolean
  setModalOpen?: (open: boolean) => void
  position: Point
  route: GtfsRoutePydanticModel
}

export const complaintTypes = ['no_ride', 'no_stop', 'delay', 'early'] as const
export type ComplaintType = (typeof complaintTypes)[number]

export interface ComplaintTypeData {
  fields: ComplaintField[]
  transport: DataCode
  subject: DataCode
}

export type ComplaintField = keyof typeof allComplaintFields
