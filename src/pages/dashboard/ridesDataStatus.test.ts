import { GroupByRes } from 'src/api/groupByService'
import { ridesDataStatus } from './ridesDataStatus'

/**
 * The dashboard alert speaks for the whole page, so it has to tell a failed request
 * apart from a successful one that reports no executed rides. The second is a finding
 * about the data, not an outage, and must not be worded as one.
 */

const ride = (totalPlannedRides: number, totalActualRides: number) =>
  ({ totalPlannedRides, totalActualRides }) as GroupByRes

describe('ridesDataStatus', () => {
  it('reports loading before the query settles, even with no rows yet', () => {
    expect(ridesDataStatus([], true, undefined)).toBe('loading')
  })

  it('prefers loading over an error left behind by a previous fetch', () => {
    expect(ridesDataStatus([], true, new Error('stale'))).toBe('loading')
  })

  it('reports an error only when the query actually failed', () => {
    expect(ridesDataStatus([], false, new Error('network'))).toBe('error')
  })

  it('reports noData when the aggregation returns no rows', () => {
    expect(ridesDataStatus([], false, undefined)).toBe('noData')
  })

  it('reports noActualRides when rides were planned but none were executed', () => {
    expect(ridesDataStatus([ride(120, 0), ride(80, 0)], false, undefined)).toBe('noActualRides')
  })

  it('reports ok when a single row has executed rides', () => {
    expect(ridesDataStatus([ride(120, 0), ride(80, 3)], false, undefined)).toBe('ok')
  })
})
