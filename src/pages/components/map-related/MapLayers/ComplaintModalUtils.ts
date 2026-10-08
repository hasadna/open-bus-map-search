import type {
  GtfsAgencyPydanticModel,
  GtfsRideStopWithRelatedPydanticModel,
  GtfsRoutePydanticModel,
  RequestSubjectSchema,
} from '@hasadna/open-bus-api-client'
import { buildComplaintTitle } from './ComplaintModalFields'
import { complaintTypeMappings } from './ComplaintModalForms'
import type { ComplaintFormValues, ComplaintUser } from './ComplaintModalTypes'

interface ComplaintSubmissionFields {
  id?: string
  passport?: string
  firstName?: string
  lastName?: string
  mobile?: string
  email?: string
  eventHour?: string
  fromHour?: string
  toHour?: string
  eventDate?: Date
  details?: string
  requestSubject: RequestSubjectSchema
  title: string
}

type ComplaintBus = {
  driverName?: string
  licenseNumber?: string
  lineNumberText?: string
  operator?: { dataText: string; dataCode: string }
  direction?: { dataText: string; dataCode: string }
  raisingStation?: { dataText: string; dataCode: string }
}
type ComplaintTrain = object

type ComplaintTaxi = object

export type ComplaintSubmissionData = ComplaintSubmissionFields &
  (
    | { bus: ComplaintBus; train?: never; taxi?: never }
    | { bus?: never; train: ComplaintTrain; taxi?: never }
    | { bus?: never; train?: never; taxi: ComplaintTaxi }
  )

export type ComplaintPersonalDetails = Pick<
  ComplaintUser,
  'firstName' | 'lastName' | 'mobile' | 'email'
> & { id?: string; passport?: string }

export function buildComplaintPersonalDetails(
  values: Partial<ComplaintUser>,
): Partial<ComplaintPersonalDetails> {
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
): ComplaintSubmissionData {
  const agency = lookup.agencies?.find((item) => item.operatorRef === values.busOperator)
  const direction = values.direction !== undefined ? lookup.routes?.[values.direction] : undefined
  const station =
    values.raisingStation !== undefined ? lookup.stops?.[values.raisingStation] : undefined
  return {
    ...buildComplaintPersonalDetails(values),
    eventHour: values.eventHour?.format('HH:mm'),
    fromHour: values.wait?.[0]?.format('HH:mm'),
    toHour: values.wait?.[1]?.format('HH:mm'),
    eventDate: values.eventDate?.toDate(),
    details: values.details,
    requestSubject: complaintTypeMappings[values.complaintType].subject,
    title: buildComplaintTitle(values),
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
  }
}
