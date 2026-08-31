import type { GtfsRideStopWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { createEvent, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { MAX_HITS_COUNT } from 'src/api/apiConfig'
import dayjs from 'src/dayjs'
import { cardHeight } from './layout'
import { TimelineBoard } from './TimelineBoard'
import { POINT_SIZE } from './TimelinePoint'

type SiriHit = Parameters<typeof TimelineBoard>[0]['siriTimes'][number]

const GTFS: GtfsRideStopWithRelatedPydanticModel[] = [
  { id: 1, arrivalTime: new Date('2026-08-20T05:30:00Z') },
  { id: 2, arrivalTime: new Date('2026-08-20T05:40:00Z') },
]
const SIRI: SiriHit[] = [
  {
    id: 3,
    siriRideVehicleRef: '17084504',
    siriRideScheduledStartTime: new Date('2026-08-20T05:00:00Z'),
    recordedAtTime: new Date('2026-08-20T05:32:00Z'),
    lat: 32.068272,
    lon: 34.79298,
    latitude: 32.068272,
    longitude: 34.79298,
  },
]

const time = (value: Date) => dayjs(value).format('HH:mm:ss')
const ACTUAL_LATE = time(SIRI[0].recordedAtTime!)

const linkFor = (hit: SiriHit) => ({
  to: `/single-line-map?focusPing=${hit.siriRideVehicleRef}-${hit.recordedAtTime!.getTime()}`,
  title: 'show on map',
})

const renderBoard = (siriLinkFor?: (hit: SiriHit) => ReturnType<typeof linkFor>) =>
  render(
    <MemoryRouter>
      <TimelineBoard
        target={dayjs('2026-08-20T05:33:00Z')}
        gtfsTimes={GTFS}
        siriTimes={SIRI}
        siriLinkFor={siriLinkFor}
      />
    </MemoryRouter>,
  )

/** A dot carries no text of its own, unlike the label that shares its title. */
const dotAt = (at: string) =>
  Array.from(document.querySelectorAll(`[title="${at}"]`)).find((el) => !el.textContent)!

/** Walks out of a card's inner columns to the positioned card itself, so the helper
 *  survives the layout being reshuffled inside it. */
const cardAt = (at: string) => {
  let el: HTMLElement | null = screen.getByText(at)
  while (el && getComputedStyle(el).position !== 'absolute') el = el.parentElement
  return el!
}

/** Every card also links its plate to the vehicle page, so links have to be told apart. */
const mapLinks = () => screen.queryAllByRole('link', { name: linkFor(SIRI[0]).title })

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
    render(
      <MemoryRouter>
        <TimelineBoard
          target={dayjs('2026-08-20T05:33:00Z')}
          gtfsTimes={GTFS}
          siriTimes={hits}
          siriLinkFor={linkFor}
        />
      </MemoryRouter>,
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

  it('cards the planned column too, with no bus of its own to name', () => {
    renderBoard(linkFor)

    const planned = cardAt(time(GTFS[0].arrivalTime!))
    expect(planned).toHaveTextContent(time(GTFS[0].arrivalTime!))
    expect(within(planned).queryByRole('link')).toBeNull()
  })

  it('draws a connector from every card, displaced or not', () => {
    renderBoard(linkFor)

    // the icons in the cards are SVG paths of their own — only the connector layer counts
    const connectors = document.querySelectorAll('svg:not(.MuiSvgIcon-root) > path')
    expect(connectors).toHaveLength(GTFS.length + SIRI.length)
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

  const renderBusyStop = () =>
    render(
      <MemoryRouter>
        <TimelineBoard
          target={dayjs('2026-08-20T05:33:00Z')}
          gtfsTimes={[]}
          siriTimes={busyStop}
          siriLinkFor={linkFor}
        />
      </MemoryRouter>,
    )

  const cardTops = () =>
    busyStop
      .map((hit) => cardAt(time(hit.recordedAtTime!)))
      .map((card) => parseFloat(getComputedStyle(card).top))
      .sort((a, b) => a - b)

  it('never lets two cards overlap', () => {
    renderBusyStop()

    const gaps = cardTops()
      .slice(1)
      .map((top, i) => top - cardTops()[i])

    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(CARD_HEIGHT)
  })

  it('grows the axis so the last card still lands on it', () => {
    renderBusyStop()

    // the lowest of the ticks capping the two axes, offset by 1 because each is a 2px bar
    // straddling the end of its axis rather than sitting on it
    const axisEnd =
      Array.from(document.querySelectorAll('.sc-boundary-tick'))
        .map((tick) => parseFloat(getComputedStyle(tick).top))
        .sort((a, b) => a - b)
        .at(-1)! + 1

    expect(cardTops().at(-1)! + CARD_HEIGHT).toBeLessThanOrEqual(axisEnd)
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
    render(
      <MemoryRouter>
        <TimelineBoard
          target={dayjs('2026-08-20T05:33:00Z')}
          gtfsTimes={GTFS}
          siriTimes={secondsApart}
          siriLinkFor={linkFor}
        />
      </MemoryRouter>,
    )

    const [first, second] = secondsApart
      .slice(1)
      .map((hit) => parseFloat(getComputedStyle(dotAt(time(hit.recordedAtTime))).top))

    expect(time(secondsApart[1].recordedAtTime)).not.toBe(time(secondsApart[2].recordedAtTime))
    expect(Math.abs(first - second)).toBeLessThan(POINT_SIZE)
    expect(mapLinks()).toHaveLength(secondsApart.length)
  })
})
