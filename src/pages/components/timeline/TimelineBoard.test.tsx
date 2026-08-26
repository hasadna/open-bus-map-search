import type { GtfsRideStopWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { fireEvent, render, screen } from '@testing-library/react'
import dayjs from 'src/dayjs'
import { TimelineBoard } from './TimelineBoard'
import { instantY, type SiriHit } from './timelinePairing'
import { ABSENT_MARK_SIZE, POINT_SIZE } from './TimelinePoint'

// One ride departing 08:00 that reaches the stop 2 minutes late, and one departing 08:20
// that never shows up at all.
const LATE = new Date('2026-08-20T05:00:00Z')
const MISSING = new Date('2026-08-20T05:20:00Z')

const GTFS: GtfsRideStopWithRelatedPydanticModel[] = [
  { id: 1, arrivalTime: new Date('2026-08-20T05:30:00Z'), gtfsRideStartTime: LATE },
  { id: 2, arrivalTime: new Date('2026-08-20T05:40:00Z'), gtfsRideStartTime: MISSING },
]
const SIRI: SiriHit[] = [
  {
    id: 3,
    siriRideVehicleRef: '17084504',
    siriRideScheduledStartTime: LATE,
    recordedAtTime: new Date('2026-08-20T05:32:00Z'),
    lat: 32.068272,
    lon: 34.79298,
    latitude: 32.068272,
    longitude: 34.79298,
  },
]

// timestampToTop over these hits: planned 05:30 -> 10, actual 05:32 -> 100, planned 05:40 -> 460.
// The fill runs centre to centre, so its height is the delay alone.
const LATE_BAND = { top: 10 + POINT_SIZE / 2, height: 90 }
const MISSING_DOT_TOP = 460
/** An actual time landing at 452.5 - close enough to the missing ride's slot that its
 *  label and that ride's marker want the same space in the label lane. */
const MISSING_NEIGHBOUR = new Date('2026-08-20T05:39:50Z')
const LABEL_HEIGHT = 18

const time = (value: Date) => dayjs(value).format('HH:mm:ss')
const PLANNED_LATE = time(GTFS[0].arrivalTime!)
const PLANNED_MISSING = time(GTFS[1].arrivalTime!)
const ACTUAL_LATE = time(SIRI[0].recordedAtTime!)

const renderBoard = () =>
  render(<TimelineBoard target={dayjs('2026-08-20T05:33:00Z')} gtfsTimes={GTFS} siriTimes={SIRI} />)

/** A dot carries no text of its own, unlike the label that shares its title. */
const dotAt = (at: string) =>
  Array.from(document.querySelectorAll(`[title="${at}"]`)).find((el) => !el.textContent)!

const labelAt = (at: string) =>
  Array.from(document.querySelectorAll(`[title="${at}"]`)).find((el) => el.textContent)!

const hoverAt = (clientY: number) =>
  fireEvent.mouseMove(screen.getByTestId('timeline-board'), { clientY })

describe('TimelineBoard deviation colouring', () => {
  const bandColor = () =>
    getComputedStyle(screen.getAllByTestId('timeline-band')[0]).backgroundColor

  it('fills a late ride red — the taller the gap, the more red surface', () => {
    renderBoard()
    hoverAt(LATE_BAND.top + 1)

    expect(bandColor()).toContain('var(--timeline-late)')
    expect(screen.getByTestId('timeline-band')).toHaveStyle({
      height: `${LATE_BAND.height}px`,
    })
  })

  // Its bounding rules are this element's own borders, so they cannot drift off its edges
  // the way separately positioned lines did — what has to hold is that the element covers
  // exactly the planned instant down to the actual one.
  it('covers exactly the planned instant down to the actual one', () => {
    renderBoard()
    hoverAt(LATE_BAND.top + 1)

    const band = getComputedStyle(screen.getByTestId('timeline-band'))
    expect(parseFloat(band.top)).toBe(instantY(10))
    expect(parseFloat(band.top) + parseFloat(band.height)).toBe(instantY(100))
  })

  // A departure run by two vehicles used to colour only one of them.
  it('splits a double trip that missed in both directions, at the scheduled instant', () => {
    render(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={[GTFS[0]]}
        siriTimes={[
          SIRI[0], // 05:32, late
          { ...SIRI[0], id: 7, recordedAtTime: new Date('2026-08-20T05:29:00Z') }, // early
        ]}
      />,
    )
    hoverAt(60)

    const blocks = screen.getAllByTestId('timeline-band').map((el) => getComputedStyle(el))
    expect(blocks).toHaveLength(2)
    expect(blocks.map((block) => block.backgroundColor)).toEqual([
      expect.stringContaining('var(--timeline-early)'),
      expect.stringContaining('var(--timeline-late)'),
    ])
    // full width, and abutting at the planned instant rather than stacking over it
    expect(blocks.map((block) => [block.left, block.width])).toEqual([
      ['0px', '100%'],
      ['0px', '100%'],
    ])
    const [early, late] = blocks.map((block) => ({
      top: parseFloat(block.top),
      bottom: parseFloat(block.top) + parseFloat(block.height),
    }))
    expect(early.bottom).toBe(late.top)
  })

  // The block says how bad the worst vehicle was, not how many there were.
  it('stretches one block to the farthest vehicle when several miss the same way', () => {
    render(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={[GTFS[0]]}
        siriTimes={[
          SIRI[0], // 05:32
          { ...SIRI[0], id: 7, recordedAtTime: new Date('2026-08-20T05:34:00Z') },
          { ...SIRI[0], id: 8, recordedAtTime: new Date('2026-08-20T05:40:00Z') }, // worst
        ]}
      />,
    )
    hoverAt(60)

    const blocks = screen.getAllByTestId('timeline-band')
    expect(blocks).toHaveLength(1)
    const block = getComputedStyle(blocks[0])
    const worst = getComputedStyle(dotAt(time(new Date('2026-08-20T05:40:00Z'))))
    expect(parseFloat(block.top) + parseFloat(block.height)).toBe(instantY(parseFloat(worst.top)))
  })

  it('fills an early ride amber instead, so the two deviations stay distinguishable', () => {
    // same ride, but the bus passed the stop before it was due
    render(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={[
          { id: 1, arrivalTime: new Date('2026-08-20T05:32:00Z'), gtfsRideStartTime: LATE },
        ]}
        siriTimes={[{ ...SIRI[0], recordedAtTime: new Date('2026-08-20T05:30:00Z') }]}
      />,
    )
    hoverAt(50)

    expect(bandColor()).toContain('var(--timeline-early)')
  })
})

describe('TimelineBoard absent counterparts', () => {
  it('marks a scheduled ride that never reported, on the actual axis, without hovering', () => {
    renderBoard()

    // MISSING departs 08:20 and has no actual hit at all
    const mark = screen.getByTestId('CloseIcon').parentElement!
    expect(mark).toHaveAccessibleName()
    // stands in the label lane, centred on the instant it is missing from
    const top = parseFloat(getComputedStyle(mark).top)
    expect(top + ABSENT_MARK_SIZE / 2).toBe(instantY(MISSING_DOT_TOP))
  })

  it('nudges a marker clear of a time it would cover, and draws its leader line', () => {
    render(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={GTFS}
        // reports a second after the missing ride's slot, so its label sits on the marker
        siriTimes={[SIRI[0], { ...SIRI[0], id: 6, recordedAtTime: MISSING_NEIGHBOUR }]}
      />,
    )

    const mark = screen.getByTestId('CloseIcon').parentElement!
    const neighbour = labelAt(time(MISSING_NEIGHBOUR))
    const markTop = parseFloat(getComputedStyle(mark).top)
    const labelTop = parseFloat(getComputedStyle(neighbour).top)

    expect(markTop - labelTop).toBeGreaterThanOrEqual(LABEL_HEIGHT)
    // pushed off its instant, so a leader line has to say where it belongs
    expect(markTop + ABSENT_MARK_SIZE / 2).not.toBe(instantY(MISSING_DOT_TOP))
    expect(document.querySelectorAll('svg path').length).toBeGreaterThan(0)
  })

  it('marks a ride that ran without a schedule, on the planned axis', () => {
    render(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={GTFS}
        siriTimes={[
          SIRI[0],
          { ...SIRI[0], id: 9, siriRideScheduledStartTime: new Date('2026-08-20T06:00:00Z') },
        ]}
      />,
    )

    expect(screen.getByTestId('QuestionMarkIcon').parentElement).toHaveAccessibleName()
  })

  it('says nothing about a hit whose ride has no departure time to pair on', () => {
    render(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={[{ id: 1, arrivalTime: new Date('2026-08-20T05:30:00Z') }]}
        siriTimes={[{ ...SIRI[0], siriRideScheduledStartTime: undefined }]}
      />,
    )

    expect(screen.queryByTestId('CloseIcon')).not.toBeInTheDocument()
    expect(screen.queryByTestId('QuestionMarkIcon')).not.toBeInTheDocument()
  })
})

describe('TimelineBoard pairing', () => {
  // highlighting is "scaled up at all", so the test doesn't break when the factor is tuned
  const isHighlighted = (dot: Element) => getComputedStyle(dot).transform !== 'scale(1)'

  it('highlights the planned and actual dots of one ride together, anywhere between them', () => {
    renderBoard()

    hoverAt(LATE_BAND.top + LATE_BAND.height / 2)

    expect(isHighlighted(dotAt(PLANNED_LATE))).toBe(true)
    expect(isHighlighted(dotAt(ACTUAL_LATE))).toBe(true)
    // the other ride is not part of this pair
    expect(isHighlighted(dotAt(PLANNED_MISSING))).toBe(false)
  })

  it('draws the band over the whole span between planned and actual', () => {
    renderBoard()

    hoverAt(LATE_BAND.top + 1)

    expect(screen.getByTestId('timeline-band')).toHaveStyle({
      top: `${LATE_BAND.top}px`,
      height: `${LATE_BAND.height}px`,
    })
  })

  it('still highlights a ride that never showed up, on its own', () => {
    renderBoard()

    hoverAt(MISSING_DOT_TOP + 2)

    expect(isHighlighted(dotAt(PLANNED_MISSING))).toBe(true)
    expect(isHighlighted(dotAt(ACTUAL_LATE))).toBe(false)
  })

  it('highlights nothing in the empty space between two rides', () => {
    renderBoard()

    hoverAt(250)

    expect(screen.queryByTestId('timeline-band')).not.toBeInTheDocument()
    expect(isHighlighted(dotAt(PLANNED_LATE))).toBe(false)
  })

  it('clears the highlight when the pointer leaves the board', () => {
    renderBoard()

    hoverAt(LATE_BAND.top + 1)
    fireEvent.mouseLeave(screen.getByTestId('timeline-board'))

    expect(screen.queryByTestId('timeline-band')).not.toBeInTheDocument()
  })
})
