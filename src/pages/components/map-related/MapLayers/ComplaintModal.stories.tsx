import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import { useState } from 'react'
import type { BusToolTipProps } from './BusToolTip'
import ComplaintModal from './ComplaintModal'

const meta = {
  title: 'Map/Layers/ComplaintModal',
  component: ComplaintModal,
  parameters: {
    layout: 'centered',
    eyes: {
      waitBeforeCapture: 'form', // Wait for the modal to open before capturing
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

const mockedSiriRideWithRelated = [
  {
    id: 27432536,
    siri_route_id: 973,
    journey_ref: '2023-01-01-3795919',
    scheduled_start_time: '2023-01-01T08:20:00+00:00',
    vehicle_ref: '23321002',
    updated_first_last_vehicle_locations: '2023-01-01T09:02:24.535567+00:00',
    first_vehicle_location_id: 1450990113,
    last_vehicle_location_id: 1451178879,
    updated_duration_minutes: '2023-01-01T15:04:39.332290+00:00',
    duration_minutes: 39,
    journey_gtfs_ride_id: 29868036,
    route_gtfs_ride_id: 29686636,
    gtfs_ride_id: 29868036,
    siri_route__line_ref: 2974,
    siri_route__operator_ref: 3,
    gtfs_ride__gtfs_route_id: 1986151,
    gtfs_ride__journey_ref: '3795919_010123',
    gtfs_ride__start_time: '2023-01-02T08:20:00+00:00',
    gtfs_ride__end_time: '2023-01-02T08:56:23+00:00',
    gtfs_route__date: '2023-01-02',
    gtfs_route__line_ref: 2974,
    gtfs_route__operator_ref: 3,
    gtfs_route__route_short_name: '1',
    gtfs_route__route_long_name: 'שדרות מנחם בגין/כביש 7-גדרה<->שדרות מנחם בגין/כביש 7-גדרה-3#',
    gtfs_route__route_mkt: '33001',
    gtfs_route__route_direction: '3',
    gtfs_route__route_alternative: '#',
    gtfs_route__agency_name: 'אגד',
    gtfs_route__route_type: '3',
  },
]

const siriRidesHandler = http.get(
  (info) => new URL(info.request.url).pathname === '/siri_rides/list',
  ({ request }) => {
    const { searchParams } = new URL(request.url)
    const matchesRouteId = searchParams.get('siri_route_ids') === '973'
    const matchesLineRef = searchParams.get('siri_route_line_refs') === '2974'
    const matchesVehicleRef = searchParams.get('vehicle_refs') === '23321002'

    if (!matchesRouteId || !matchesLineRef || !matchesVehicleRef) {
      return HttpResponse.json([])
    }

    return HttpResponse.json(mockedSiriRideWithRelated)
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
      handlers: [siriRidesHandler],
    },
  },
  args: {
    position: defaultArgs.position,
    modalOpen: true,
  },
}
