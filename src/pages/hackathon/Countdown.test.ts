import { computeTimeLeft } from './Countdown'

describe('computeTimeLeft', () => {
  const target = '2026-06-03T23:59:00+03:00'
  const targetMs = new Date(target).getTime()

  it('returns positive components when target is in the future', () => {
    const now = targetMs - (2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5_000)
    expect(computeTimeLeft(target, now)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
      isClosed: false,
    })
  })

  it('marks closed when target has passed', () => {
    const now = targetMs + 1_000
    expect(computeTimeLeft(target, now).isClosed).toBe(true)
  })

  it('marks closed at exactly the target time', () => {
    expect(computeTimeLeft(target, targetMs).isClosed).toBe(true)
  })
})
