import type { Meta, StoryObj } from '@storybook/react-vite'
import { Gap, serializeGap } from 'src/api/gapsService'
import dayjs, { ISRAEL_TIMEZONE } from 'src/dayjs'
import GapsTable from './GapsTable'

const meta = {
  title: 'Components/GapsTable',
  component: GapsTable,
  parameters: {
    layout: 'centered',
  },

  argTypes: {
    gaps: {
      description: 'List of gap objects to display in the table',
      control: { type: 'object' },
      table: {
        type: { summary: 'RideExecutionPydanticModel[]' },
      },
    },
    loading: {
      description: 'Whether the table is in loading state',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
      },
    },
    initOnlyGapped: {
      description: 'Show only gapped rows initially',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
      },
    },
  },
} satisfies Meta<typeof GapsTable>

export default meta

type Story = StoryObj<typeof meta>
// Fixed Israel-local service day: dayjs.tz(str, tz) reads the digits AS Israel
// wall-clock, so the rendered times are identical on every machine (CI runs in UTC)
// and stable across DST — unlike dayjs(str).tz(tz), which re-anchors by the runner's
// zone. The gaps are passed through serializeGap → reviveGap (the real cache path).
const serviceDay = dayjs.tz('2025-01-01', ISRAEL_TIMEZONE)
const mockGaps: Gap[] = [
  // as planned (green): planned === actual
  {
    plannedStartTime: serviceDay.set('hour', 13),
    actualStartTime: serviceDay.set('hour', 13),
  },
  // duplicate (cyan): a second ride sharing the 13:00 actual
  {
    plannedStartTime: undefined,
    actualStartTime: serviceDay.set('hour', 13),
  },
  // missing (red): a past planned ride with no actual
  {
    plannedStartTime: serviceDay.set('hour', 14),
    actualStartTime: undefined,
  },
  // extra (yellow): an actual with no matching planned
  {
    plannedStartTime: undefined,
    actualStartTime: serviceDay.set('hour', 14).set('minute', 30),
  },
  // in the future (blue): GapsTable derives this state by comparing against the
  // current time, so this row must stay relative to "now" — a fixed past literal
  // would render as "missing". Being a later calendar day, it also carries the
  // single 🌙 next-day marker.
  {
    plannedStartTime: dayjs().tz(ISRAEL_TIMEZONE).startOf('day').add(1, 'day').set('hour', 15),
    actualStartTime: undefined,
  },
]

export const Default: Story = {
  args: {
    gaps: mockGaps.map(serializeGap),
    date: serviceDay.format('YYYY-MM-DD'),
    singleLineMapBaseHref:
      '/single-line-map?date=2025-01-01&operatorId=3&lineNumber=5&routeKey=10018-2',
  },
}

export const OnlyGappe: Story = {
  args: {
    gaps: mockGaps.map(serializeGap),
    date: serviceDay.format('YYYY-MM-DD'),
    initOnlyGapped: true,
    singleLineMapBaseHref:
      '/single-line-map?date=2025-01-01&operatorId=3&lineNumber=5&routeKey=10018-2',
  },
}
