import type {
  ComplaintsSendPostRequestData,
  ComplaintsSendPostRequestDataLangEnum,
  GtfsAgencyPydanticModel,
  GtfsRideStopWithRelatedPydanticModel,
  GtfsRoutePydanticModel,
} from 'D:\\WEB\\open-bus-api-client\\open-bus-api-client\\client\\src'
import { complaintTypeMappings } from './ComplaintModalForms'
import type { ComplaintFormValues, ComplaintUser } from './ComplaintModalTypes'

export function buildComplaintPersonalDetails(values: Partial<ComplaintUser>) {
  const { documentType, id_fild, passport_fild, firstName, lastName, mobile, email } = values
  const documentNumber = (documentType === 'passport' ? passport_fild : id_fild)?.trim()
  if (!documentType || !documentNumber) throw new Error('Complaint identity document is required')
  return {
    firstName,
    lastName,
    ...(documentType === 'passport' ? { passport: documentNumber } : { id: documentNumber }),
    email,
    mobile,
    ravkav: values.ravKavNumber || undefined,
  }
}

interface ComplaintLookupData {
  agencies?: GtfsAgencyPydanticModel[]
  routes?: GtfsRoutePydanticModel[]
  stops?: GtfsRideStopWithRelatedPydanticModel[]
}

export function buildComplaintData(
  values: ComplaintFormValues,
  lookup: ComplaintLookupData,
  lang?: string,
): ComplaintsSendPostRequestData {
  if (!values.email) throw new Error('Complaint email is required')
  if (!values.eventHour) throw new Error('Complaint event hour is required')
  if (!values.eventDate) throw new Error('Complaint event date is required')
  const agency = lookup.agencies?.find((item) => item.operatorRef === values.busOperator)
  const direction = values.direction !== undefined ? lookup.routes?.[values.direction] : undefined
  const station =
    values.raisingStation !== undefined ? lookup.stops?.[values.raisingStation] : undefined
  const bus = {
    driverName: values.driverName,
    licenseNumber: values.licenseNumber,
    lineNumberText: values.lineNumberText,
    operator: {
      dataText: agency?.agencyName,
      dataCode: agency?.operatorRef === undefined ? undefined : String(agency.operatorRef),
    },
    direction: {
      dataText: direction?.routeLongName || direction?.routeShortName,
      dataCode:
        direction?.routeMkt ||
        direction?.routeDirection ||
        (direction?.id === undefined ? undefined : String(direction.id)),
    },
    raisingStation: {
      dataText: station?.gtfsStopName,
      dataCode: station?.gtfsStopCode === undefined ? undefined : String(station.gtfsStopCode),
    },
  }
  if (
    !bus.lineNumberText ||
    [bus.operator, bus.direction, bus.raisingStation].some(
      (selection) => !selection.dataText || !selection.dataCode,
    )
  )
    throw new Error('Complaint bus selections require a label and code')
  return {
    ...buildComplaintPersonalDetails(values),
    email: values.email,
    eventHour: values.eventHour?.format('HH:mm'),
    fromHour: values.wait?.[0]?.format('HH:mm'),
    toHour: values.wait?.[1]?.format('HH:mm'),
    eventDate: values.eventDate?.toDate(),
    details: values.details,
    transport: complaintTypeMappings[values.complaintType].transport,
    subject: complaintTypeMappings[values.complaintType].subject,
    lang: (lang && ['he', 'en', 'ru', 'ar'].includes(lang.split('-')[0])
      ? lang.split('-')[0]
      : 'he') as ComplaintsSendPostRequestDataLangEnum,
    bus,
    train: undefined,
  } as ComplaintsSendPostRequestData
}
