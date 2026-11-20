import type { BusSchema, ComplaintFormSchema } from 'D:\\WEB\\open-bus-api-client\\client\\src'
import type dayjs from 'dayjs'
import type { allComplaintFields } from './ComplaintModalFields'

export type ComplaintField = keyof typeof allComplaintFields

export type ComplaintUser = Pick<
  ComplaintFormSchema,
  'firstName' | 'lastName' | 'email' | 'mobile'
> & {
  documentType: 'id' | 'passport'
  id_fild: string
  passport_fild: string
  emailConfirmation: ComplaintFormSchema['email']
  ravKavNumber?: ComplaintFormSchema['ravkav']
}

export type ComplaintFormValues = Partial<ComplaintUser> &
  Pick<ComplaintFormSchema, 'details'> &
  Partial<Pick<BusSchema, 'licenseNumber' | 'driverName' | 'lineNumberText'>> & {
    complaintType: keyof typeof complaintTypeMappings
    busOperator?: number
    eventDate?: dayjs.Dayjs
    eventHour?: dayjs.Dayjs
    direction?: number
    wait?: [dayjs.Dayjs, dayjs.Dayjs]
    raisingStation?: number
    debug?: boolean | 'bounce'
  }

export const complaintTypeMappings = {
  no_ride: {
    fields: [
      'busOperator',
      'licenseNumber',
      'eventDate',
      'eventHour',
      'wait',
      'lineNumberText',
      'direction',
      'raisingStation',
      'driverName',
    ],
    transport: { dataText: 'אוטובוס', dataCode: '0' },
    subject: { dataText: 'אי ביצוע נסיעה', dataCode: '2' },
  },
  no_stop: {
    fields: [
      'busOperator',
      'licenseNumber',
      'eventDate',
      'eventHour',
      'wait',
      'lineNumberText',
      'direction',
      'raisingStation',
      'driverName',
    ],
    transport: { dataText: 'אוטובוס', dataCode: '0' },
    subject: { dataText: 'אי עצירה בתחנה', dataCode: '3' },
  },
  delay: {
    fields: [
      'busOperator',
      'licenseNumber',
      'eventDate',
      'eventHour',
      'wait',
      'lineNumberText',
      'direction',
      'raisingStation',
      'driverName',
    ],
    transport: { dataText: 'אוטובוס', dataCode: '0' },
    subject: { dataText: 'איחור', dataCode: '4' },
  },
  early: {
    fields: [
      'busOperator',
      'licenseNumber',
      'eventDate',
      'eventHour',
      'wait',
      'lineNumberText',
      'direction',
      'raisingStation',
      'driverName',
    ],
    transport: { dataText: 'אוטובוס', dataCode: '0' },
    subject: { dataText: 'הקדמה', dataCode: '11' },
  },
} satisfies Record<
  string,
  Pick<ComplaintFormSchema, 'transport' | 'subject'> & { fields: ComplaintField[] }
>
