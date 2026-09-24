import 'src/dayjs'
import { civilDate } from 'src/model/time/civilDate'
import { getGapsWithVehiclesAsync, parseTime } from './gapsService'

const ridesExecutionListGet = vi.hoisted(() => vi.fn())
const siriRidesListGet = vi.hoisted(() => vi.fn())

vi.mock('src/api/apiConfig', () => ({
  USER_CASE_API: { ridesExecutionListGet },
  SIRI_API: { siriRidesListGet },
}))

describe('parseTime', () => {
  it('returns undefined when time is undefined', () => {
    expect(parseTime(undefined)).toBeUndefined()
  })

  it('returns undefined for an invalid date string', () => {
    expect(parseTime('not-a-date')).toBeUndefined()
  })

  it('converts UTC time to Israel timezone (summer, UTC+3)', () => {
    const result = parseTime('2026-06-09T04:24:00Z')
    expect(result?.format('HH:mm')).toBe('07:24')
  })
})

describe('getGapsWithVehiclesAsync', () => {
  const date = civilDate('2026-09-09')!
  const departure = new Date('2026-09-09T02:15:00Z')

  beforeEach(() => {
    vi.clearAllMocks()
    ridesExecutionListGet.mockResolvedValue([])
    siriRidesListGet.mockResolvedValue([])
  })

  it('asks the API for the requested calendar day', async () => {
    await getGapsWithVehiclesAsync(date, '5', 27081)
    const { dateFrom, dateTo } = ridesExecutionListGet.mock.calls[0][0]
    expect(dateFrom.toISOString().substring(0, 10)).toBe('2026-09-09')
    expect(dateTo.toISOString().substring(0, 10)).toBe('2026-09-09')
  })

  it('asks SIRI for the Israel-local day, not the UTC one', async () => {
    await getGapsWithVehiclesAsync(date, '5', 27081)
    const { scheduledStartTimeFrom, scheduledStartTimeTo } = siriRidesListGet.mock.calls[0][0]
    expect(scheduledStartTimeFrom.toISOString()).toBe('2026-09-08T21:00:00.000Z')
    expect(scheduledStartTimeTo.toISOString()).toBe('2026-09-09T20:59:59.999Z')
  })

  it('attaches the plate of the SIRI ride that departed at the actual start time', async () => {
    ridesExecutionListGet.mockResolvedValue([
      { plannedStartTime: departure, actualStartTime: departure },
    ])
    siriRidesListGet.mockResolvedValue([
      { scheduledStartTime: departure, vehicleRef: '9305101' },
      { scheduledStartTime: new Date('2026-09-09T02:40:00Z'), vehicleRef: '53104703' },
    ])

    const [gap] = await getGapsWithVehiclesAsync(date, '5', 27081)
    expect(gap.vehicleRefs).toEqual(['9305101'])
  })

  it('keeps every plate when two buses share one departure', async () => {
    ridesExecutionListGet.mockResolvedValue([
      { plannedStartTime: departure, actualStartTime: departure },
      { plannedStartTime: undefined, actualStartTime: departure },
    ])
    siriRidesListGet.mockResolvedValue([
      { scheduledStartTime: departure, vehicleRef: '9305101' },
      { scheduledStartTime: departure, vehicleRef: '53104703' },
    ])

    const gaps = await getGapsWithVehiclesAsync(date, '5', 27081)
    expect(gaps.map((gap) => gap.vehicleRefs)).toEqual([
      ['9305101', '53104703'],
      ['9305101', '53104703'],
    ])
  })

  it('leaves a missing ride without plates', async () => {
    ridesExecutionListGet.mockResolvedValue([
      { plannedStartTime: departure, actualStartTime: undefined },
    ])
    siriRidesListGet.mockResolvedValue([{ scheduledStartTime: departure, vehicleRef: '9305101' }])

    const [gap] = await getGapsWithVehiclesAsync(date, '5', 27081)
    expect(gap.vehicleRefs).toBeUndefined()
  })

  it('still returns the gaps when the SIRI request fails', async () => {
    ridesExecutionListGet.mockResolvedValue([
      { plannedStartTime: departure, actualStartTime: departure },
    ])
    siriRidesListGet.mockRejectedValue(new Error('offline'))

    const [gap] = await getGapsWithVehiclesAsync(date, '5', 27081)
    expect(gap.plannedStartTime?.format('HH:mm')).toBe('05:15')
    expect(gap.vehicleRefs).toBeUndefined()
  })
})
