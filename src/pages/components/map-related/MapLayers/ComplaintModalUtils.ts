import type {
  ComplaintsSendPostRequestData,
  ComplaintsSendPostRequestDataLangEnum,
  GtfsAgencyPydanticModel,
  GtfsRideStopWithRelatedPydanticModel,
  GtfsRoutePydanticModel,
} from 'D:\\WEB\\open-bus-api-client\\open-bus-api-client\\client\\src'
import { buildComplaintTitle } from './ComplaintModalFields'
import { complaintTypeMappings } from './ComplaintModalForms'
import type { ComplaintFormValues, ComplaintUser } from './ComplaintModalTypes'

export function buildComplaintPersonalDetails(values: Partial<ComplaintUser>) {
  const { documentType, id_fild, passport_fild, firstName, lastName, mobile, email } = values
  return {
    firstName,
    lastName,
    ...(documentType === 'passport' ? { passport: passport_fild } : { id: id_fild }),
    email,
    mobile,
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
    title: buildComplaintTitle(values),
    lang: lang as ComplaintsSendPostRequestDataLangEnum,
    bus: {
      driverName: values.driverName,
      licenseNumber: values.licenseNumber,
      lineNumberText: values.lineNumberText,
      operator: agency
        ? { dataText: agency.agencyName || '', dataCode: String(agency.operatorRef) }
        : undefined,
      direction: direction
        ? {
            dataText: direction.routeLongName || direction.routeShortName || '',
            dataCode: direction.routeMkt || direction.routeDirection || String(direction.id),
          }
        : undefined,
      raisingStation: station
        ? {
            dataText: station.gtfsStopName || '',
            dataCode: String(station.gtfsStopCode),
          }
        : undefined,
    },
    train: undefined,
  } as ComplaintsSendPostRequestData
}
