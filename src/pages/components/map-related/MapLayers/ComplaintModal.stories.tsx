import type { GtfsRoutePydanticModel } from '@hasadna/open-bus-api-client'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import { useState } from 'react'
import { busToolTipMockedSiriRides } from '../../../../../.storybook/mockData'
import type { BusToolTipProps } from './BusToolTip'
import ComplaintModal from './ComplaintModal'

const meta = {
  title: 'Map/Layers/ComplaintModal',
  component: ComplaintModal,
  parameters: {
    layout: 'centered',
    eyes: {
      waitBeforeCapture: 'button[type="submit"]',
    },
  },
  argTypes: {
    modalOpen: {
      control: 'boolean',
    },
    setModalOpen: {
      action: 'setModalOpen',
    },
    position: {
      control: 'object',
      description: 'The position of the bus',
      table: {
        type: { summary: 'BusToolTipProps' },
      },
    },
  },
  decorators: [
    (Story, meta) => {
      const [modalOpen, setModalOpen] = useState(meta.args.modalOpen)

      return (
        <>
          <button
            onClick={() => {
              setModalOpen(true)
              meta.args.setModalOpen?.(true)
            }}>
            Open Model
          </button>
          <Story
            args={{
              ...meta.args,
              modalOpen,
              setModalOpen: (open) => {
                setModalOpen(open)
                meta.args.setModalOpen?.(open)
              },
            }}
          />
        </>
      )
    },
  ],
} satisfies Meta<typeof ComplaintModal>

export default meta

type Story = StoryObj<typeof meta>

const siriRidesHandler = http.get(
  (info) => new URL(info.request.url).pathname === '/siri_rides/list',
  ({ request }) => {
    const { searchParams } = new URL(request.url)
    const matchesRouteId = searchParams.get('siri_route_ids') === '973'
    const matchesLineRef = searchParams.get('siri_route__line_refs') === '2974'
    const matchesVehicleRef = searchParams.get('vehicle_refs') === '23321002'

    if (!matchesRouteId || !matchesLineRef || !matchesVehicleRef) {
      return HttpResponse.json([])
    }

    return HttpResponse.json(busToolTipMockedSiriRides)
  },
)

const agenciesHandler = http.get('*/gtfs_agencies/list', () =>
  HttpResponse.json([{ date: '2023-11-01', operatorRef: 3, agencyName: 'אגד' }]),
)

const routesHandler = http.get('*/gtfs_routes/list', ({ request }) => {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('operator_refs') !== '3') return HttpResponse.json([])
  return HttpResponse.json([
    {
      id: 125758768,
      date: '2023-11-01',
      lineRef: 19785,
      operatorRef: 3,
      routeShortName: '2',
      routeLongName: 'ראשון לציון-גדרה',
      routeMkt: '81002',
      routeDirection: '1',
    },
  ])
})

const ridesHandler = http.get('*/gtfs_rides/list', () =>
  HttpResponse.json([{ id: 1, gtfsRouteId: 125758768 }]),
)

const rideStopsHandler = http.get('*/gtfs_ride_stops/list', () =>
  HttpResponse.json([
    {
      id: 1,
      gtfsStopCode: 2550,
      gtfsStopName: 'תחנת דוגמה',
      gtfsStopDate: '2023-11-01',
      stopSequence: 1,
    },
  ]),
)

const defaultArgs: BusToolTipProps & { route: GtfsRoutePydanticModel } = {
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
  route: {
    id: 125758768,
    date: new Date('2025-10-27'),
    lineRef: 19785,
    operatorRef: 3,
    routeShortName: '2',
    routeLongName: 'וייצמן/כצנלסון-גדרה<->שדרות מנחם בגין/כביש 7-גדרה-1#',
    routeMkt: '81002',
    routeDirection: '1',
    routeAlternative: '#',
    agencyName: 'אגד',
    routeType: '3',
  },
}

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [siriRidesHandler, agenciesHandler, routesHandler, ridesHandler, rideStopsHandler],
    },
  },
  args: {
    position: defaultArgs.position,
    route: defaultArgs.route,
    modalOpen: true,
  },
}
