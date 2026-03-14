import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import { waitFor, within } from 'storybook/test'
import Widget from 'src/shared/Widget'
import {
  busToolTipMockedRoute,
  busToolTipMockedSiriRides,
} from '../../../../../.storybook/mockData'
import { BusToolTip, BusToolTipProps } from './BusToolTip'

const meta = {
  title: 'Map/Layers/BusToolTip',
  component: BusToolTip,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <Widget>
        <Story />
      </Widget>
    ),
  ],
} satisfies Meta<typeof BusToolTip>

export default meta

type Story = StoryObj<typeof meta>

const routeHandler = http.get(
  (info) => new URL(info.request.url).pathname === '/gtfs_routes/list',
  ({ request }) => {
    const { searchParams } = new URL(request.url)
    const matchesLineRef = searchParams.get('line_refs') === '2974'
    const matchesOperatorRef = searchParams.get('operator_refs') === '3'

    if (!matchesLineRef || !matchesOperatorRef) {
      return HttpResponse.json()
    }

    return HttpResponse.json(busToolTipMockedRoute)
  },
)

const ridesHandler = http.get(
  (info) => new URL(info.request.url).pathname === '/siri_rides/list',
  ({ request }) => {
    const { searchParams } = new URL(request.url)

    const matchesLineRef = searchParams.get('siri_route__line_refs') === '2974'
    const matchesRouteRef = searchParams.get('siri_route_ids') === '973'
    const matchesVehicleRef = searchParams.get('vehicle_refs') === '23321002'

    if (!matchesLineRef || !matchesRouteRef || !matchesVehicleRef) {
      return HttpResponse.json()
    }

    return HttpResponse.json(busToolTipMockedSiriRides)
  },
)

const defaultArgs: BusToolTipProps = {
  position: {
    loc: [31.799982, 34.786926],
    color: 22,
    operator: 3,
    bearing: 106,
    recordedAtTime: 1698809440000,
    point: {
      id: 2838516282,
      siriSnapshotId: 919509,
      siriRideStopId: 1370461085,
      recordedAtTime: new Date('2023-11-01T03:30:40+00:00'),
      lon: 34.786926,
      lat: 31.799982,
      bearing: 106,
      velocity: 22,
      distanceFromJourneyStart: 636,
      distanceFromSiriRideStopMeters: 278,
      siriSnapshotSnapshotId: '2023/11/01/03/30',
      siriRouteId: 973,
      siriRouteLineRef: 2974,
      siriRouteOperatorRef: 3,
      siriRideId: 52703935,
      siriRideJourneyRef: '2023-11-01-56650774',
      siriRideScheduledStartTime: new Date('2023-11-01T03:30:00+00:00'),
      siriRideVehicleRef: '23321002',
      siriRideFirstVehicleLocationId: 2838509585,
      siriRideLastVehicleLocationId: 2838555351,
      siriRideDurationMinutes: 27,
      siriRideGtfsRideId: 57365030,
    },
  },
  icon: '/bus-logos/3.svg',
}

export const Default: Story = {
  args: defaultArgs,
  parameters: {
    msw: {
      handlers: [routeHandler, ridesHandler],
    },
  },
}

export const WithComplaint: Story = {
  args: defaultArgs,
  parameters: {
    msw: {
      handlers: [routeHandler, ridesHandler],
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement)
    // Wait for the route to finish loading
    await waitFor(() => canvas.getByText('אגד'))
    // Type the easter egg code to reveal the complaint button
    await userEvent.type(canvasElement, 'complaint')
    // Confirm the complaint button appeared
    await waitFor(() =>
      canvas.getByRole('button', { name: /פתח תלונה|Open complaint|Открыть жалобу/i }),
    )
  },
}
