import type { ComplaintType, ComplaintTypeData } from './ComplaintModalTypes'

export const complaintTypeMappings: Record<ComplaintType, ComplaintTypeData> = {
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
}
