import { parseOriginDepartures } from './kavBochanService'

describe('parseOriginDepartures', () => {
  it('counts the first origin category as early and every category as measured', () => {
    const index = {
      updated: '2026-11-27T05:14Z',
      days: [{ d: '2026-11-26', sched: 119106, o: [279, 70573, 3201, 1270, 355] }],
    }

    expect(parseOriginDepartures(index)).toEqual([
      { date: '2026-11-26', early: 279, measured: 75678 },
    ])
  })

  it('skips the days it cannot read instead of failing the whole index', () => {
    const index = {
      days: [
        { d: '2026-11-24' },
        { d: '2026-11-25', o: [1, 2.5, 3] },
        { d: '2026-02-30', o: [1, 2, 3] },
        { d: '2026-11-26', o: [0, 0, 0, 0, 0] },
        null,
        { d: '2026-11-27', o: [2, 98, 0, 0, 0] },
      ],
    }

    expect(parseOriginDepartures(index)).toEqual([{ date: '2026-11-27', early: 2, measured: 100 }])
  })

  it.each([null, {}, { days: 'none' }])('rejects an index without a days list: %j', (index) => {
    expect(() => parseOriginDepartures(index)).toThrow('no days list')
  })
})
