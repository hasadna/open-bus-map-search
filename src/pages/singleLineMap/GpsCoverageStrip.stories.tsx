import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  type Point,
  type PositionGroup,
  ROUTE_COLORS,
} from 'src/pages/components/map-related/map-types'
import { GpsCoverageStrip } from './GpsCoverageStrip'

/**
 * Fixed epoch (ms) every fixture is anchored to, so the rendered HH:mm:ss axis labels are
 * deterministic across visual-regression runs (no `Date.now()` creeping into snapshots).
 */
const BASE = 1745222400000 // 2025-04-21T08:00:00Z

/**
 * Build a one-ride {@link PositionGroup} from a list of inter-ping gaps (seconds). The first
 * ping sits at {@link BASE}; each subsequent ping advances time by the given gap and nudges
 * the location proportionally, so the gap tooltip's "distance moved" is non-zero and a longer
 * dropout reads as a longer hop on the map.
 */
const makeGroup = (
  intervalsSec: number[],
  opts: {
    color?: string
    label?: string
    vehicleRef?: string
    startLoc?: [number, number]
  } = {},
): PositionGroup => {
  const { color = ROUTE_COLORS[1], label, vehicleRef, startLoc = [32.0853, 34.7818] } = opts
  let time = BASE
  let [lat, lon] = startLoc
  const positions: Point[] = [{ loc: [lat, lon], color: 0, recordedAtTime: time }]
  for (const sec of intervalsSec) {
    time += sec * 1000
    lat += 0.0006 * (sec / 30)
    lon += 0.0004 * (sec / 30)
    positions.push({ loc: [lat, lon], color: 0, recordedAtTime: time })
  }
  return { positions, color, label, vehicleRef }
}

/** Steady ~30s cadence — every column is a short green baseline (coverage is healthy). */
const healthyGroup = makeGroup(Array<number>(12).fill(30), {
  vehicleRef: '23311102',
  color: ROUTE_COLORS[2],
})

/** Steady cadence broken by a single 10-minute silence — one tall red dropout band. */
const dropoutGroup = makeGroup([30, 30, 30, 30, 600, 30, 30, 30, 30], {
  vehicleRef: '23321002',
  color: ROUTE_COLORS[0],
})

/** Gaps spanning the whole scale: on-cadence → stretched (orange) → dropout (red). */
const mixedGroup = makeGroup([30, 30, 60, 90, 30, 150, 30, 300, 30, 45], {
  vehicleRef: '23331003',
  color: ROUTE_COLORS[3],
})

/** A ride whose pings all share one `recordedAtTime` collapses to a single distinct ping. */
const onePingGroup: PositionGroup = {
  positions: [
    { loc: [32.0853, 34.7818], color: 0, recordedAtTime: BASE },
    { loc: [32.0853, 34.7818], color: 0, recordedAtTime: BASE },
  ],
  color: ROUTE_COLORS[4],
  vehicleRef: '23341004',
}

/** A ride that reported no usable pings (all timestamps invalid) — the "no reports" notice. */
const noPingsGroup: PositionGroup = {
  positions: [
    { loc: [32.0853, 34.7818], color: 0, recordedAtTime: 0 },
    { loc: [32.0853, 34.7818], color: 0, recordedAtTime: 0 },
  ],
  color: ROUTE_COLORS[1],
  vehicleRef: '23351005',
}

const meta = {
  component: GpsCoverageStrip,
  title: 'SingleLineMap/GpsCoverageStrip',
  args: {
    positionGroups: [healthyGroup],
    // Render the disclosure open so the strip is actually visible in every story (in the app
    // it starts collapsed as an opt-in diagnostic). Done via a prop rather than a `play`
    // click so it holds in the Docs view and visual snapshots, not just the canvas.
    defaultExpanded: true,
  },
  argTypes: {
    positionGroups: {
      control: false,
      table: { type: { summary: 'PositionGroup[]' } },
    },
    onFocusPing: { action: 'focusPing' },
  },
} satisfies Meta<typeof GpsCoverageStrip>

export default meta

type Story = StoryObj<typeof meta>

/** Healthy ride: an even run of short green columns. */
export const HealthyRide: Story = {}

/** A single long silence in an otherwise healthy ride shows as one wide red band. */
export const WithDropout: Story = {
  args: { positionGroups: [dropoutGroup] },
}

/** Gaps across the full severity scale — green through orange to red. */
export const MixedSeverity: Story = {
  args: { positionGroups: [mixedGroup] },
}

/** Several selected vehicles, each its own card with an independent strip. */
export const MultipleVehicles: Story = {
  args: { positionGroups: [healthyGroup, dropoutGroup, mixedGroup] },
}

/** A vehicle that reported only one distinct time — notice instead of a blank strip. */
export const SingleReport: Story = {
  args: { positionGroups: [onePingGroup] },
}

/** A vehicle with no usable reports — the "no reports" notice. */
export const NoReports: Story = {
  args: { positionGroups: [noPingsGroup] },
}

/** Mix of plottable rides and the two empty-state notices in one list. */
export const MixedStates: Story = {
  args: { positionGroups: [healthyGroup, onePingGroup, noPingsGroup] },
}
