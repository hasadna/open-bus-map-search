import { RequestSubjectSchema } from 'd:\\web\\open-bus-api-client\\open-bus-api-client\\client\\src\\index'
import { ComplainteField } from './ComplaintModalFields'

export const complaintTypes = [
  'no_ride',
  'no_stop',
  'delay',
  'overcrowded',
  'early',
  'add_or_remove_station',
  'add_new_line',
  'add_frequency',
  // 'driver_behavior', request file upload
  'cleanliness',
  'fine_appeal',
  'route_change',
  'line_switch',
  'station_signs',
  'ticketing_fares_discounts',
  'other',
  // 'train_delay',
  // 'train_no_ride',
  // 'train_early',
  // 'train_driver_behavior',
] as const

export type ComplaintType = (typeof complaintTypes)[number]

export interface ComplaintTypeData {
  fields: ComplainteField[]
  subject: RequestSubjectSchema
  subject_code: number
}

export const complaintTypeMappings: Record<ComplaintType, ComplaintTypeData> = {
  no_ride: {
    fields: [
      'busOperator',
      'licenseNum',
      'eventDate',
      'eventHour',
      'wait',
      'lineNumberText',
      'direction',
      'raisingStation',
      'busDirectionFrom',
      'busDirectionTo',
    ],
    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'אי ביצוע נסיעה', dataCode: 2 },
    },
    subject_code: 3,
  },
  no_stop: {
    fields: [
      'busOperator',
      'licenseNum',
      'eventDate',
      'eventHour',
      'wait',
      'lineNumberText',
      'direction',
      'raisingStation',
      'busDirectionFrom',
      'busDirectionTo',
    ],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'אי עצירה בתחנה', dataCode: 3 },
    },
    subject_code: 0,
  },
  delay: {
    fields: [
      'busOperator',
      'licenseNum',
      'eventDate',
      'eventHour',
      'wait',
      'lineNumberText',
      'direction',
      'raisingStation',
      'busDirectionFrom',
      'busDirectionTo',
    ],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'איחור', dataCode: 4 },
    },
    subject_code: 0,
  },
  early: {
    fields: [
      'busOperator',
      'licenseNum',
      'eventDate',
      'eventHour',
      'wait',
      'lineNumberText',
      'direction',
      'raisingStation',
      'busDirectionFrom',
      'busDirectionTo',
    ],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'הקדמה', dataCode: 11 },
    },
    subject_code: 215,
  },
  overcrowded: {
    fields: [
      'busOperator',
      'licenseNum',
      'eventDate',
      'eventHour',
      'wait',
      'lineNumberText',
      'direction',
      'raisingStation',
      'busDirectionFrom',
      'busDirectionTo',
    ],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'דיווח על עומס נוסעים', dataCode: 7 },
    },
    subject_code: 64,
  },
  add_or_remove_station: {
    fields: [
      'busOperator',
      'eventDate',
      'lineNumberText',
      'direction',
      'addOrRemoveStation',
      'raisingStation',
      'raisingStationAddress',
      'busDirectionFrom',
      'busDirectionTo',
    ],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'הסרת/ הוספת תחנה', dataCode: 6 },
    },
    subject_code: 186,
  },
  add_new_line: {
    fields: ['raisingStationCity', 'destinationStationCity'],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'הוספת קו חדש', dataCode: 8 },
    },
    subject_code: 10,
  },
  add_frequency: {
    fields: [
      'addingFrequencyReason',
      'busOperator',
      'eventDate',
      'eventHour',
      'wait',
      'lineNumberText',
      'direction',
      'raisingStation',
      'busDirectionFrom',
      'busDirectionTo',
    ],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'הוספת תדירות', dataCode: 9 },
    },
    subject_code: 28,
  },
  // driver_behavior: {
  //   fields: [
  //     'busOperator',
  //     'licenseNum',
  //     'eventDate',
  //     'eventHour',
  //     'wait',
  //     'lineNumberText',
  //     'direction',
  //     'raisingStation',
  //     'busDirectionFrom',
  //     'busDirectionTo',
  //     'firstDeclaration',
  //     'secondDeclaration',
  //   ],
  //   applySubject: { dataText: 'אוטובוס', dataCode: 0 },
  //   applyType: { dataText: 'התנהגות נהג', dataCode: 12 },
  //   subject_code: 0,
  // },
  cleanliness: {
    fields: [
      'busOperator',
      'licenseNum',
      'eventDate',
      'eventHour',
      'lineNumberText',
      'direction',
      'busDirectionFrom',
      'busDirectionTo',
      'raisingStation',
    ],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'ניקיון ותקינות אוטובוס', dataCode: 13 },
    },
    subject_code: 0,
  },
  fine_appeal: {
    fields: [
      'ravKavNumber',
      'busOperator',
      'reportdate',
      'reportTime',
      'lineNumberText',
      'direction',
      'raisingStation',
      'busDirectionFrom',
      'busDirectionTo',
    ],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'ערעורים על השתת תעריף מוגדל (קנס)', dataCode: 14 },
    },
    subject_code: 201,
  },
  route_change: {
    fields: [
      'busOperator',
      'eventDate',
      'lineNumberText',
      'direction',
      'busDirectionFrom',
      'busDirectionTo',
    ],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'שינוי מסלול', dataCode: 16 },
    },
    subject_code: 8,
  },
  line_switch: {
    fields: ['busDirectionFrom', 'busDirectionTo'],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'מעבר בין קווים', dataCode: 17 },
    },
    subject_code: 218,
  },
  station_signs: {
    fields: [
      'busOperator',
      'eventDate',
      'eventHour',
      'raisingStationCity',
      'raisingStationAddress',
      // 'stationCatNum',
      // 'lineNumberText',
    ],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'תקינות שלטי המידע בתחנה', dataCode: 18 },
    },
    subject_code: 0,
  },
  ticketing_fares_discounts: {
    fields: ['ravKavNumber'],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'אמצעי כרטוס (רב-קו), תעריפים, הנחות', dataCode: 35 },
    },
    subject_code: 6,
  },
  other: {
    fields: [],

    subject: {
      applySubject: { dataText: 'אוטובוס', dataCode: 0 },
      applyType: { dataText: 'אחר', dataCode: 1 },
    },
    subject_code: 0,
  },
}
