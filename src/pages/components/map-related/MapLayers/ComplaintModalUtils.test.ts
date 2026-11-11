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

  it.each(['id', 'passport'] as const)('rejects an empty %s', (documentType) => {
    expect(() =>
      buildComplaintPersonalDetails({ documentType, id_fild: ' ', passport_fild: ' ' }),
    ).toThrow('Complaint identity document is required')
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
        ravKavNumber: '12345678901',
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
      ravkav: '12345678901',
      lang: 'he',
      bus: {
        operator: { dataText: 'Agency', dataCode: '3' },
        direction: { dataText: 'Route', dataCode: '123' },
        raisingStation: { dataText: 'Stop', dataCode: '1234' },
      },
    })
    expect(data).not.toHaveProperty('personalDetails')
    expect(data).not.toHaveProperty('title')
    expect(data.bus).not.toHaveProperty('eventHour')
    expect(data.bus).not.toHaveProperty('fromHour')
    expect(data.bus).not.toHaveProperty('toHour')
    expect(data.bus).not.toHaveProperty('eventDate')
    expect(data.bus).not.toHaveProperty('details')
    expect(() =>
      buildComplaintData(
        {
          complaintType: 'delay',
          details: 'Late bus',
          ...identityDetails,
          documentType: 'id',
          id_fild: '000000001',
          eventDate,
          eventHour: eventDate,
          lineNumberText: '2',
        },
        {},
      ),
    ).toThrow('Complaint bus selections require a label and code')
    const pairKey = 'b6c4c7fe-35ef-401a-8f26-a1b137837fd1'
    const request = await new ComplaintsApi(new Configuration()).complaintsSendPostRequestOpts({
      pairKey,
      complaintsSendPostRequest: { data, debug: true },
    })
    expect(request.headers).toMatchObject({ 'pair-key': pairKey })
    const body: unknown = JSON.parse(JSON.stringify(request.body))
    expect(body).toMatchObject({
      debug: true,
      data: {
        ravkav: '12345678901',
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
    expect(body).not.toHaveProperty('data.title')
    expect(body).not.toHaveProperty('data.train')
    expect(body).not.toHaveProperty('data.taxi')
    expect(body).toHaveProperty('data.id', '000000000')
    expect(body).not.toHaveProperty('data.passport')

    const passportData = { ...data }
    Object.assign(
      passportData,
      buildComplaintPersonalDetails({
        documentType: 'passport',
        passport_fild: ' A1234567 ',
      }),
    )
    Reflect.deleteProperty(passportData, 'id')
    const passportRequest = await new ComplaintsApi(
      new Configuration(),
    ).complaintsSendPostRequestOpts({
      pairKey,
      complaintsSendPostRequest: {
        data: passportData,
      },
    })
    const passportBody: unknown = JSON.parse(JSON.stringify(passportRequest.body))
    expect(passportBody).toHaveProperty('data.passport', 'A1234567')
    expect(passportBody).not.toHaveProperty('data.id')
  })
})
