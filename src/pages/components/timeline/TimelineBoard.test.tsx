import type { GtfsRideStopWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { createEvent, fireEvent, render, screen, within } from '@testing-library/react'
import { type ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import { MAX_HITS_COUNT } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import { cardHeight } from './layout'
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
/** An actual card with no map link: its time over the row naming the bus. */
const ACTUAL_CARD_HEIGHT = cardHeight(1)

const time = (value: Date) => dayjs(value).format('HH:mm:ss')
const PLANNED_LATE = time(GTFS[0].arrivalTime!)
const PLANNED_MISSING = time(GTFS[1].arrivalTime!)
const ACTUAL_LATE = time(SIRI[0].recordedAtTime!)

const linkFor = (hit: SiriHit) => ({
  to: `/single-line-map?focusPing=${hit.siriRideVehicleRef}-${hit.recordedAtTime!.getTime()}`,
  title: 'show on map',
})

/** Every card links its bus to the vehicle page, so a board only renders under a router. */
const routed = (board: ReactElement) => render(<MemoryRouter>{board}</MemoryRouter>)

const renderBoard = (siriLinkFor?: (hit: SiriHit) => ReturnType<typeof linkFor>) =>
  routed(
    <TimelineBoard
      target={dayjs('2026-08-20T05:33:00Z')}
      gtfsTimes={GTFS}
      siriTimes={SIRI}
      siriLinkFor={siriLinkFor}
    />,
  )

/** A dot carries no text of its own, unlike the label that shares its title. */
const dotAt = (at: string) =>
  Array.from(document.querySelectorAll(`[title="${at}"]`)).find((el) => !el.textContent)!

const labelAt = (at: string) =>
  Array.from(document.querySelectorAll(`[title="${at}"]`)).find((el) => el.textContent)!

/** Walks out of a card's inner columns to the positioned card itself, so the helper
 *  survives the layout being reshuffled inside it. */
const cardAt = (at: string) => {
  let el: HTMLElement | null = screen.getByText(at)
  while (el && getComputedStyle(el).position !== 'absolute') el = el.parentElement
  return el!
}

/** Every card also links its plate to the vehicle page, so links have to be told apart. */
const mapLinks = () => screen.queryAllByRole('link', { name: linkFor(SIRI[0]).title })

const hoverAt = (clientY: number) =>
  fireEvent.mouseMove(screen.getByTestId('timeline-board'), { clientY })

/** How much colour a fill lays down. Overlapping fills compound, so this is also how
 *  severity accumulates — and how much the pointer deepens the ride it is reading. */
const fillAlpha = (band: Element) =>
  parseFloat(getComputedStyle(band).backgroundColor.match(/\/\s*([\d.]+)%/)![1])

const bandBox = (band: Element) => {
  const style = getComputedStyle(band)
  return { top: parseFloat(style.top), bottom: parseFloat(style.top) + parseFloat(style.height) }
}

describe('TimelineBoard deviation colouring', () => {
  const bandColor = () =>
    getComputedStyle(screen.getAllByTestId('timeline-band')[0]).backgroundColor

  it('fills a late ride red — the taller the gap, the more red surface', () => {
    renderBoard()

    expect(bandColor()).toContain('var(--timeline-late)')
    expect(screen.getByTestId('timeline-band')).toHaveStyle({
      height: `${LATE_BAND.height}px`,
    })
  })

  it('covers exactly the planned instant down to the actual one', () => {
    renderBoard()

    const band = getComputedStyle(screen.getByTestId('timeline-band'))
    expect(parseFloat(band.top)).toBe(instantY(10))
    expect(parseFloat(band.top) + parseFloat(band.height)).toBe(instantY(100))
  })

  it('splits a double trip that missed in both directions, at the scheduled instant', () => {
    routed(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={[GTFS[0]]}
        siriTimes={[
          SIRI[0], // 05:32, late
          { ...SIRI[0], id: 7, recordedAtTime: new Date('2026-08-20T05:29:00Z') }, // early
        ]}
      />,
    )

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
    routed(
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

    const blocks = screen.getAllByTestId('timeline-band')
    expect(blocks).toHaveLength(1)
    const block = getComputedStyle(blocks[0])
    const worst = getComputedStyle(dotAt(time(new Date('2026-08-20T05:40:00Z'))))
    expect(parseFloat(block.top) + parseFloat(block.height)).toBe(instantY(parseFloat(worst.top)))
  })

  it('fills an early ride amber instead, so the two deviations stay distinguishable', () => {
    // same ride, but the bus passed the stop before it was due
    routed(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={[
          { id: 1, arrivalTime: new Date('2026-08-20T05:32:00Z'), gtfsRideStartTime: LATE },
        ]}
        siriTimes={[{ ...SIRI[0], recordedAtTime: new Date('2026-08-20T05:30:00Z') }]}
      />,
    )

    expect(bandColor()).toContain('var(--timeline-early)')
  })

  // Two rides late over the same minutes. Both fills are drawn, so the minutes they share
  // carry twice the colour — the darker patch says two buses were off there, not one.
  it('draws every deviating ride, so overlapping fills stack', () => {
    routed(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={[
          { id: 1, arrivalTime: new Date('2026-08-20T05:30:00Z'), gtfsRideStartTime: LATE },
          { id: 2, arrivalTime: new Date('2026-08-20T05:32:00Z'), gtfsRideStartTime: MISSING },
        ]}
        siriTimes={[
          { ...SIRI[0], recordedAtTime: new Date('2026-08-20T05:36:00Z') },
          {
            ...SIRI[0],
            id: 4,
            siriRideScheduledStartTime: MISSING,
            recordedAtTime: new Date('2026-08-20T05:38:00Z'),
          },
        ]}
      />,
    )

    const [first, second] = screen.getAllByTestId('timeline-band').map(bandBox)
    expect(second.top).toBeLessThan(first.bottom)
    expect(first.top).toBeLessThan(second.top)
  })
})

describe('TimelineBoard hover emphasis', () => {
  /** Both rides run late, so the board holds two fills to compare. */
  const renderTwoLateRides = () =>
    routed(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={GTFS}
        siriTimes={[
          SIRI[0],
          {
            ...SIRI[0],
            id: 4,
            siriRideScheduledStartTime: MISSING,
            recordedAtTime: new Date('2026-08-20T05:42:00Z'),
          },
        ]}
      />,
    )

  const alphas = () => screen.getAllByTestId('timeline-band').map(fillAlpha)

  it('deepens the ride under the pointer and leaves the rest faint', () => {
    renderTwoLateRides()
    const [faint, otherFaint] = alphas()
    expect(otherFaint).toBe(faint)

    hoverAt(50) // between the first ride's planned and actual dots

    const [hovered, untouched] = alphas()
    expect(hovered).toBeGreaterThan(faint)
    expect(untouched).toBe(faint)
  })

  /** The connector layer only — the icons inside the cards are SVG paths of their own. */
  const connectorWidths = () =>
    Array.from(document.querySelectorAll('svg:not(.MuiSvgIcon-root) > path')).map((path) =>
      path.getAttribute('stroke-width'),
    )

  it('thickens the card and the line leading to it, for that ride alone', () => {
    renderBoard(linkFor)
    expect(getComputedStyle(cardAt(ACTUAL_LATE)).boxShadow).toBe('none')

    hoverAt(LATE_BAND.top + LATE_BAND.height / 2)

    expect(getComputedStyle(cardAt(ACTUAL_LATE)).boxShadow).toContain('--timeline-highlight-ring')
    // the planned and actual cards of the hovered ride, out of the four the board draws
    expect(connectorWidths().filter((width) => width === '2')).toHaveLength(2)
    expect(connectorWidths().filter((width) => width === '1')).toHaveLength(2)
  })

  it('fades the ride back once the pointer leaves the board', () => {
    renderTwoLateRides()
    const [faint] = alphas()

    hoverAt(50)
    fireEvent.mouseLeave(screen.getByTestId('timeline-board'))

    expect(alphas()[0]).toBe(faint)
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
    routed(
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

    expect(markTop - labelTop).toBeGreaterThanOrEqual(ACTUAL_CARD_HEIGHT)
    // pushed off its instant, so a leader line has to say where it belongs
    expect(markTop + ABSENT_MARK_SIZE / 2).not.toBe(instantY(MISSING_DOT_TOP))
    expect(document.querySelectorAll('svg path').length).toBeGreaterThan(0)
  })

  it('marks a ride that ran without a schedule, on the planned axis', () => {
    routed(
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
    routed(
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
    const faint = fillAlpha(screen.getByTestId('timeline-band'))

    hoverAt(250)

    expect(isHighlighted(dotAt(PLANNED_LATE))).toBe(false)
    expect(fillAlpha(screen.getByTestId('timeline-band'))).toBe(faint)
  })

  it('clears the highlight when the pointer leaves the board', () => {
    renderBoard()

    hoverAt(LATE_BAND.top + 1)
    expect(isHighlighted(dotAt(PLANNED_LATE))).toBe(true)
    fireEvent.mouseLeave(screen.getByTestId('timeline-board'))

    expect(isHighlighted(dotAt(PLANNED_LATE))).toBe(false)
  })
})

describe('TimelineBoard actual-time links', () => {
  it('renders plain, unlinked times when no link builder is given', () => {
    renderBoard()

    expect(mapLinks()).toHaveLength(0)
    expect(screen.getByText(ACTUAL_LATE)).toBeInTheDocument()
  })

  it('links every actual time by its icon, leaving the time itself plain text', () => {
    renderBoard(linkFor)

    const [link, ...rest] = mapLinks()
    expect(rest).toHaveLength(0)
    expect(link).toHaveAttribute('href', linkFor(SIRI[0]).to)
    expect(link).toHaveAccessibleName(linkFor(SIRI[0]).title)
    expect(link).not.toHaveTextContent(ACTUAL_LATE)
    expect(screen.getByText(ACTUAL_LATE)).toBeInTheDocument()
  })

  it('names the map link in its row, so no tooltip has to explain the icon', () => {
    renderBoard(linkFor)

    const link = screen.getByRole('link', { name: linkFor(SIRI[0]).title })
    expect(cardAt(ACTUAL_LATE)).toHaveTextContent(linkFor(SIRI[0]).title)
    // A title on the link or on any ancestor would draw a browser tooltip over the row
    expect(link.closest('[title]')).toBeNull()
  })

  it('leaves the dots unlinked, since several can land on one pixel', () => {
    renderBoard(linkFor)

    expect(dotAt(ACTUAL_LATE).tagName).toBe('DIV')
    expect(dotAt(ACTUAL_LATE)).not.toHaveAttribute('href')
  })

  // The target reads its state out of the query string, and MainRoute only parses that
  // at app mount — so this must be a real navigation. A client-side Link would call
  // preventDefault here and the ping would never arrive.
  it('navigates for real instead of client-side, so the query string is actually read', () => {
    renderBoard(linkFor)

    const link = screen.getByRole('link', { name: linkFor(SIRI[0]).title })
    const click = createEvent.click(link)
    fireEvent(link, click)

    expect(click.defaultPrevented).toBe(false)
  })
})

describe('TimelineBoard ride cards', () => {
  const boardOf = (hits: SiriHit[]) =>
    routed(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={GTFS}
        siriTimes={hits}
        siriLinkFor={linkFor}
      />,
    )

  it('names the bus without waiting for a hover', () => {
    renderBoard(linkFor)

    expect(within(cardAt(ACTUAL_LATE)).getByText('170-84-504')).toBeInTheDocument()
  })

  it('stacks the time over a grid of one labelled row per link the ride offers', () => {
    renderBoard(linkFor)

    const [timeRow, details] = Array.from(cardAt(ACTUAL_LATE).children) as HTMLElement[]
    expect(timeRow).toHaveTextContent(ACTUAL_LATE)
    // both rows share one 2x2 grid, so their links line up under each other
    const [mapLabel, mapValue, plateLabel, plateValue] = Array.from(
      details.children,
    ) as HTMLElement[]
    expect(mapLabel).toHaveTextContent(linkFor(SIRI[0]).title)
    expect(within(mapValue).getByRole('link')).toHaveAttribute('href', linkFor(SIRI[0]).to)
    expect(plateLabel).toHaveTextContent('vehicle plate')
    expect(within(plateValue).getByRole('link')).toHaveTextContent('170-84-504')
  })

  it('opens the vehicle page on the day the ride departed, not the day being browsed', () => {
    renderBoard(linkFor)

    const plate = screen.getByRole('link', { name: /170-84-504/ })
    // the timeline searches ±4h, so a hit can belong to the neighbouring day; 05:00Z
    // departs on the 20th in Israel time
    expect(plate).toHaveAttribute('href', '/vehicle?vehicle.vehicleNumber=17084504&date=2026-08-20')
  })

  it('leaves a hit with no plate as a card holding just its time', () => {
    boardOf([{ ...SIRI[0], siriRideVehicleRef: undefined }])

    expect(screen.queryByRole('link', { name: /\d{2}-\d{3}-\d{2}/ })).toBeNull()
    expect(cardAt(ACTUAL_LATE)).toHaveTextContent(ACTUAL_LATE)
  })

  // The fills span the whole board, so a see-through card would read its text over one.
  it('stands each card on ground of its own, themed with the board', () => {
    renderBoard(linkFor)

    expect(getComputedStyle(cardAt(ACTUAL_LATE)).backgroundColor).toContain('--timeline-card-bg')
    expect(screen.getByTestId('timeline-board').parentElement!.style).toHaveProperty(
      'cssText',
      expect.stringContaining('--timeline-card-bg:'),
    )
  })

  it('cards the planned column too, with no bus of its own to name', () => {
    renderBoard(linkFor)

    const planned = cardAt(time(GTFS[0].arrivalTime!))
    expect(planned).toHaveTextContent(time(GTFS[0].arrivalTime!))
    expect(within(planned).queryByRole('link')).toBeNull()
  })

  it('draws a connector from every card, and from the marker standing in for a missing one', () => {
    renderBoard(linkFor)

    // the icons in the cards are SVG paths of their own — only the connector layer counts
    const connectors = document.querySelectorAll('svg:not(.MuiSvgIcon-root) > path')
    // one per time in either column, plus the ✕ for the ride that never reported
    expect(connectors).toHaveLength(GTFS.length + SIRI.length + 1)
  })
})

// A card is three times the height of the bare time it replaced, so a busy stop has far more
// label than axis to hang it on.
describe('TimelineBoard card stacking', () => {
  // time, the map-link row and the plate row
  const CARD_HEIGHT = cardHeight(2)
  // one every two minutes — dense enough that the natural positions all collide
  const busyStop: SiriHit[] = Array.from({ length: MAX_HITS_COUNT }, (_, i) => ({
    ...SIRI[0],
    id: 100 + i,
    recordedAtTime: new Date(Date.UTC(2026, 7, 20, 5, i * 2)),
  }))

  const renderBusyStop = (gtfsTimes: GtfsRideStopWithRelatedPydanticModel[] = []) =>
    routed(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={gtfsTimes}
        siriTimes={busyStop}
        siriLinkFor={linkFor}
      />,
    )

  /** The ticks capping the two axes, offset by 1 because each is a 2px bar straddling the
   *  end of its axis rather than sitting on it. */
  const axisBounds = () => {
    const ticks = Array.from(document.querySelectorAll('.sc-boundary-tick'))
      .map((tick) => parseFloat(getComputedStyle(tick).top) + 1)
      .sort((a, b) => a - b)
    return { start: ticks[0], end: ticks.at(-1)! }
  }

  const cardTops = () =>
    busyStop
      .map((hit) => cardAt(time(hit.recordedAtTime!)))
      .map((card) => parseFloat(getComputedStyle(card).top))
      .sort((a, b) => a - b)

  it('never lets two cards overlap', () => {
    renderBusyStop()

    const tops = cardTops()
    const gaps = tops.slice(1).map((top, i) => top - tops[i])

    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(CARD_HEIGHT)
  })

  it('grows the axis so the last card still lands on it', () => {
    renderBusyStop()

    expect(cardTops().at(-1)! + CARD_HEIGHT).toBeLessThanOrEqual(axisBounds().end)
  })

  // Four scheduled departures that never reported: their ✕ markers stand in the actual
  // column's label lane, competing with its cards for the same axis.
  const neverRan: GtfsRideStopWithRelatedPydanticModel[] = Array.from({ length: 4 }, (_, i) => ({
    id: 200 + i,
    arrivalTime: new Date(Date.UTC(2026, 7, 20, 5, i * 8 + 1)),
    gtfsRideStartTime: new Date(Date.UTC(2026, 7, 20, 4, i)),
  }))

  it('grows it for the absent markers too, so the first card is not pushed off the top', () => {
    renderBusyStop(neverRan)

    expect(screen.getAllByTestId('CloseIcon')).toHaveLength(neverRan.length)
    expect(cardTops()[0]).toBeGreaterThanOrEqual(axisBounds().start)
  })
})

// Line 70א at stop 36090 on 2026-06-11 had three actual times within four seconds. The
// axis spans hours, so their dots land on top of each other however the scale is computed
// — which is why a dot can never say which ride a click meant. Labels escape it through
// resolveCollisions, so the link lives on the icon in the label, and nowhere else.
describe('TimelineBoard overlapping dots', () => {
  const secondsApart = [
    { ...SIRI[0], recordedAtTime: new Date('2026-08-20T05:32:00Z') },
    { ...SIRI[0], id: 4, recordedAtTime: new Date('2026-08-20T05:35:59Z') },
    { ...SIRI[0], id: 5, recordedAtTime: new Date('2026-08-20T05:36:00Z') },
  ]

  it('draws rides a second apart within one dot of each other, yet keeps each label distinct', () => {
    routed(
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={GTFS}
        siriTimes={secondsApart}
        siriLinkFor={linkFor}
      />,
    )

    const [first, second] = secondsApart
      .slice(1)
      .map((hit) => parseFloat(getComputedStyle(dotAt(time(hit.recordedAtTime))).top))

    expect(time(secondsApart[1].recordedAtTime)).not.toBe(time(secondsApart[2].recordedAtTime))
    expect(Math.abs(first - second)).toBeLessThan(POINT_SIZE)
    expect(mapLinks()).toHaveLength(secondsApart.length)
  })
})
