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
    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: '0' },
      applyType: { dataText: 'אי ביצוע נסיעה', dataCode: '2' },
    },
    subject_code: 3,
    title_order: ['lineNumberText', 'eventDate', 'eventHour'],
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
    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: '0' },
      applyType: { dataText: 'אי עצירה בתחנה', dataCode: '3' },
    },
    subject_code: 0,
    title_order: ['lineNumberText', 'eventDate', 'eventHour'],
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
    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: '0' },
      applyType: { dataText: 'איחור', dataCode: '4' },
    },
    subject_code: 0,
    title_order: ['lineNumberText', 'eventDate', 'eventHour'],
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
    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: '0' },
      applyType: { dataText: 'הקדמה', dataCode: '11' },
    },
    subject_code: 215,
    title_order: ['lineNumberText', 'eventDate', 'eventHour'],
  },
}
