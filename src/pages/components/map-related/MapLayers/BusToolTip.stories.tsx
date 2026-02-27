import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import Widget from 'src/shared/Widget'
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

const mockedRoute = [
  {
    id: 3753789,
    date: '2023-11-01',
    line_ref: 2974,
    operator_ref: 3,
    route_short_name: '1',
    route_long_name: 'שדרות מנחם בגין/כביש 7-גדרה<->שדרות מנחם בגין/כביש 7-גדרה-3#',
    route_mkt: '33001',
    route_direction: '3',
    route_alternative: '#',
    agency_name: 'אגד',
    route_type: '3',
  },
]

const routeHandler = http.get(
  (info) => new URL(info.request.url).pathname === '/gtfs_routes/list',
  ({ request }) => {
    const { searchParams } = new URL(request.url)
    const matchesLineRef = searchParams.get('line_refs') === '2974'
    const matchesOperatorRef = searchParams.get('operator_refs') === '3'

    if (!matchesLineRef || !matchesOperatorRef) {
      return HttpResponse.json()
    }

    return HttpResponse.json(mockedRoute)
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
  parameters: {
    msw: {
      handlers: [routeHandler],
    },
  },
  args: defaultArgs,
}

export const WithComplaint: Story = {
  parameters: {
    msw: {
      handlers: [routeHandler],
    },
  },
  args: defaultArgs,
  play: async ({ canvasElement, userEvent }) => {
    // Simulate typing 'complaint' to trigger the EasterEgg
    await new Promise((resolve) => setTimeout(resolve, 1000)) // wait for 1 second
    userEvent.type(canvasElement, 'complaint')
  },
}
