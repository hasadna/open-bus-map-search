import {
  ComplaintsApi,
  Configuration,
} from 'D:\\WEB\\open-bus-api-client\\open-bus-api-client\\client\\src'
import { describe, expect, it } from 'vitest'
import dayjs from 'src/dayjs'
import { buildComplaintData, buildComplaintPersonalDetails } from './ComplaintModalUtils'

const identityDetails = {
  firstName: 'אביבה',
  lastName: 'כהן',
  mobile: '050-1234567',
  email: 'aviva@example.com',
  emailConfirmation: 'aviva@example.com',
}

describe('buildComplaintPersonalDetails', () => {
  it('sends an ID under id and excludes confirmation-only fields', () => {
    expect(
      buildComplaintPersonalDetails({
        ...identityDetails,
        documentType: 'id',
        id_fild: '000000000',
      }),
    ).toEqual({
      firstName: 'אביבה',
      lastName: 'כהן',
      mobile: '050-1234567',
      email: 'aviva@example.com',
      id: '000000000',
    })
  })

  it('sends a passport under passport without an ID field', () => {
    expect(
      buildComplaintPersonalDetails({
        ...identityDetails,
        documentType: 'passport',
        passport_fild: 'A1234567',
      }),
    ).toEqual({
      firstName: 'אביבה',
      lastName: 'כהן',
      mobile: '050-1234567',
      email: 'aviva@example.com',
      passport: 'A1234567',
    })
  })
})

describe('complaint payload', () => {
  it('maps selected lookup values and serializes the bus complaint request', async () => {
    const eventDate = dayjs('2026-10-06T08:00:00')
    const data = buildComplaintData(
      {
        complaintType: 'delay',
        details: 'Late bus',
        email: identityDetails.email,
        documentType: 'id',
        id_fild: '000000000',
        busOperator: 3,
        direction: 0,
        raisingStation: 0,
        eventDate,
        eventHour: eventDate,
        wait: [eventDate.subtract(10, 'minute'), eventDate.add(10, 'minute')],
        lineNumberText: '2',
      },
      {
        agencies: [{ date: new Date('2026-10-06'), operatorRef: 3, agencyName: 'Agency' }],
        routes: [
          {
            id: 4,
            date: new Date('2026-10-06'),
            lineRef: 2,
            operatorRef: 3,
            routeLongName: 'Route',
            routeMkt: '123',
          },
        ],
        stops: [{ gtfsStopCode: 1234, gtfsStopName: 'Stop' }],
      },
    )
    expect(data).toMatchObject({
      eventHour: '08:00',
      fromHour: '07:50',
      toHour: '08:10',
      eventDate: eventDate.toDate(),
      id: '000000000',
      details: 'Late bus',
      bus: {
        operator: { dataText: 'Agency', dataCode: '3' },
        direction: { dataText: 'Route', dataCode: '123' },
        raisingStation: { dataText: 'Stop', dataCode: '1234' },
      },
    })
    expect(data).not.toHaveProperty('personalDetails')
    expect(data.bus).not.toHaveProperty('eventHour')
    expect(data.bus).not.toHaveProperty('fromHour')
    expect(data.bus).not.toHaveProperty('toHour')
    expect(data.bus).not.toHaveProperty('eventDate')
    expect(data.bus).not.toHaveProperty('details')
    const pairKey = 'b6c4c7fe-35ef-401a-8f26-a1b137837fd1'
    const request = await new ComplaintsApi(new Configuration()).complaintsSendPostRequestOpts({
      pairKey,
      complaintsSendPostRequest: { data },
    })
    expect(request.headers).toMatchObject({ 'pair-key': pairKey })
    const body: unknown = JSON.parse(JSON.stringify(request.body))
    expect(body).toMatchObject({
      data: {
        email: identityDetails.email,
        eventDate: eventDate.toDate().toISOString(),
        bus: {
          lineNumberText: '2',
          operator: { dataText: 'Agency', dataCode: '3' },
          direction: { dataText: 'Route', dataCode: '123' },
          raisingStation: { dataText: 'Stop', dataCode: '1234' },
        },
      },
    })
    expect(body).not.toHaveProperty('data.data')
    expect(body).not.toHaveProperty('data.train')
    expect(body).not.toHaveProperty('data.taxi')
  })
})
