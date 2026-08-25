import type { GtfsRideStopWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import { createEvent, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import dayjs from 'src/dayjs'
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

describe('TimelineBoard actual-time links', () => {
  it('renders plain, unlinked times when no link builder is given', () => {
    renderBoard()

    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.getByText(ACTUAL_LATE)).toBeInTheDocument()
  })

  it('links every actual time by its icon, leaving the time itself plain text', () => {
    renderBoard(linkFor)

    // one link per SIRI hit — its icon; the planned column stays plain text
    const [link, ...rest] = screen.getAllByRole('link')
    expect(rest).toHaveLength(0)
    expect(link).toHaveAttribute('href', linkFor(SIRI[0]).to)
    // the icon has no text, so the title is the whole accessible name
    expect(link).toHaveAccessibleName(linkFor(SIRI[0]).title)
    // the time sits beside the link rather than inside it, and so stays plain text
    expect(link).not.toHaveTextContent(ACTUAL_LATE)
    expect(screen.getByText(ACTUAL_LATE)).toBeInTheDocument()
  })

  it('explains the icon with a tooltip, and no native title to draw a second one', async () => {
    renderBoard(linkFor)

    const link = screen.getByRole('link', { name: linkFor(SIRI[0]).title })
    // A title on the link or on any ancestor would show a browser tooltip behind the MUI one
    expect(link.closest('[title]')).toBeNull()

    fireEvent.mouseOver(link)

    expect(await screen.findByRole('tooltip')).toHaveTextContent(linkFor(SIRI[0]).title)
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
    // ...while each label stays its own target
    expect(screen.getAllByRole('link')).toHaveLength(secondsApart.length)
  })
})
