import type { GtfsRideStopWithRelatedPydanticModel } from '@hasadna/open-bus-api-client'
import type { Meta, StoryObj } from '@storybook/react-vite'
import dayjs from 'src/dayjs'
import { TimelineBoard } from 'src/pages/components/timeline/TimelineBoard'
import type { SiriHit } from 'src/pages/components/timeline/timelinePairing'

/** Fixed instants, so the rendered HH:mm:ss labels never move between visual runs. */
const at = (time: string) => new Date(`2026-08-20T${time}Z`)

/** A scheduled arrival. `departure` is what pairs it with an actual hit. */
const planned = (
  id: number,
  arrival: string,
  departure: string,
): GtfsRideStopWithRelatedPydanticModel => ({
  id,
  arrivalTime: at(arrival),
  gtfsRideStartTime: at(departure),
})

/** A vehicle's report. Omitting `departure` leaves the hit unpairable. */
const actual = (id: number, recorded: string, departure?: string): SiriHit => ({
  id,
  siriRideVehicleRef: String(17084500 + id),
  siriRideScheduledStartTime: departure ? at(departure) : undefined,
  recordedAtTime: at(recorded),
  lat: 32.068272,
  lon: 34.79298,
  latitude: 32.068272,
  longitude: 34.79298,
})

const meta = {
  component: TimelineBoard,
  title: 'Timeline/TimelineBoard',
  args: {
    target: dayjs('2026-08-20T05:33:00Z'),
    gtfsTimes: [planned(1, '05:30:00', '05:00:00')],
    siriTimes: [actual(2, '05:32:00', '05:00:00')],
  },
  argTypes: {
    gtfsTimes: { control: false },
    siriTimes: { control: false },
  },
} satisfies Meta<typeof TimelineBoard>

export default meta

type Story = StoryObj<typeof meta>

/** Three departures that all reported: one late, one to the minute, one early. */
export const PairedRides: Story = {
  args: {
    gtfsTimes: [
      planned(1, '05:30:00', '05:00:00'),
      planned(2, '05:34:00', '05:05:00'),
      planned(3, '05:38:00', '05:10:00'),
    ],
    siriTimes: [
      actual(4, '05:32:00', '05:00:00'),
      actual(5, '05:34:00', '05:05:00'),
      actual(6, '05:36:00', '05:10:00'),
    ],
  },
}

/**
 * The two half-pairs, which are the only states drawn with a marker rather than a dot: a
 * scheduled ride that never reported (✕ in the actual column) and a ride that reported with
 * no schedule to compare against (? in the planned column).
 */
export const MissingCounterparts: Story = {
  args: {
    gtfsTimes: [planned(1, '05:30:00', '05:00:00'), planned(2, '05:40:00', '05:20:00')],
    siriTimes: [actual(3, '05:32:00', '05:00:00'), actual(4, '05:36:00', '05:15:00')],
  },
}

/** One departure run by two vehicles, missing the schedule in opposite directions. */
export const DoubleTrip: Story = {
  args: {
    gtfsTimes: [planned(1, '05:34:00', '05:00:00')],
    siriTimes: [actual(2, '05:31:00', '05:00:00'), actual(3, '05:37:00', '05:00:00')],
  },
}

/**
 * Departures seconds apart at one end of a half-hour board. The scale is normalised to the
 * whole range, so only a cluster this tight against a span this wide pushes labels off their
 * own instant — which is what the collision nudging and the leader lines are for.
 */
export const CrowdedLabels: Story = {
  args: {
    gtfsTimes: [
      planned(1, '05:30:00', '05:00:00'),
      planned(2, '05:30:06', '05:01:00'),
      planned(3, '05:30:12', '05:02:00'),
      planned(4, '05:50:00', '05:20:00'),
    ],
    siriTimes: [
      actual(5, '05:30:03', '05:00:00'),
      actual(6, '05:30:09', '05:01:00'),
      actual(7, '05:30:14', '05:02:00'),
      actual(8, '05:50:02', '05:20:00'),
    ],
  },
}

/** A day's worth of departures with every state on one board. */
export const MixedBoard: Story = {
  args: {
    gtfsTimes: [
      planned(1, '05:30:00', '05:00:00'),
      planned(2, '05:34:00', '05:05:00'),
      planned(3, '05:40:00', '05:20:00'),
      planned(4, '05:46:00', '05:25:00'),
    ],
    siriTimes: [
      actual(5, '05:32:00', '05:00:00'),
      actual(6, '05:34:00', '05:05:00'),
      actual(7, '05:36:00', '05:15:00'),
      actual(8, '05:44:00', '05:25:00'),
      actual(9, '05:45:00', '05:25:00'),
    ],
  },
}
