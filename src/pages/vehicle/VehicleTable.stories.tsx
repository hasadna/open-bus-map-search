import type { Meta, StoryObj } from '@storybook/react-vite'
import { VehicleRideRow } from './buildVehicleRideRows'
import { VehicleRidesCards, VehicleTable } from './VehicleTable'

// The vehicle page's rides table. Rows are pre-resolved by buildVehicleRideRows, so
// these stories hand the component fixed rows to pin its three render branches:
// a fully-resolved linkable ride, an unresolved ride (no matching GTFS route → dashes,
// raw operator ref, no link), and a past-midnight ride (🌙 + wall-clock time).
const meta = {
  title: 'Vehicle/VehicleTable',
  component: VehicleTable,
  parameters: { layout: 'padded' },
  args: { onRowClick: () => {} },
} satisfies Meta<typeof VehicleTable>

export default meta

type Story = StoryObj<typeof meta>

const resolvedRow: VehicleRideRow = {
  id: 1,
  operator: 'אגד',
  lineNumber: '16',
  origin: 'תל אביב',
  destination: 'ירושלים',
  displayTime: '04:30',
  href: '/single-line-map?date=2024-02-12&operatorId=97&lineNumber=16&routeKey=52016-1-%23&rideTime=04-30',
  setSearchPayload: {
    operatorId: '97',
    lineNumber: '16',
    routeKey: '52016-1-#',
    rideTime: '04-30',
  },
}

// No matching GTFS route: the line/origin/destination fall back to dashes, the
// operator to its raw ref, and the time is plain text (not a link).
const unresolvedRow: VehicleRideRow = {
  id: 2,
  operator: '3',
  lineNumber: '—',
  origin: '—',
  destination: '—',
  displayTime: '08:00',
}

// Past-midnight tail of the service day: wall-clock time prefixed with a moon.
const pastMidnightRow: VehicleRideRow = {
  id: 3,
  operator: 'אגד',
  lineNumber: '17',
  origin: 'חיפה',
  destination: 'אילת',
  displayTime: '🌙 00:30',
  href: '/single-line-map?date=2024-02-12&operatorId=97&lineNumber=17&routeKey=52017-2-%23&rideTime=24-30',
  setSearchPayload: {
    operatorId: '97',
    lineNumber: '17',
    routeKey: '52017-2-#',
    rideTime: '24-30',
  },
}

export const AllRowTypes: Story = {
  args: { rows: [resolvedRow, unresolvedRow, pastMidnightRow] },
}

export const SingleResolvedRide: Story = {
  args: { rows: [resolvedRow] },
}

export const UnresolvedRideOnly: Story = {
  args: { rows: [unresolvedRow] },
}

// The narrow-screen card layout, rendered directly so it's pinned regardless of the
// Storybook viewport (VehicleTable itself switches to this below the `sm` breakpoint).
export const MobileCards: Story = {
  args: { rows: [resolvedRow, unresolvedRow, pastMidnightRow] },
  render: (args) => <VehicleRidesCards {...args} />,
}
