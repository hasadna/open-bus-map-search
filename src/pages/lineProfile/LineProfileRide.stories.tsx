import type { Meta, StoryObj } from '@storybook/react-vite'
import { LineProfileRide } from './LineProfileRide'

const meta = {
  component: LineProfileRide,
  title: 'Pages/Profile/LineProfileRide',
  argTypes: {
    point: {
      control: 'object',
      description: 'The point of the line profile.',
      table: {
        type: { summary: 'SiriVehicleLocationWithRelatedPydanticModel' },
      },
    },
  },
} satisfies Meta<typeof LineProfileRide>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    point: {
      id: 3363687749,
      siriSnapshotId: 1065552,
      siriRideStopId: 1601431945,
      recordedAtTime: new Date('2024-02-12T03:15:01+00:00'),
      lon: 34.984745,
      lat: 32.830078,
      bearing: 202,
      velocity: 0,
      distanceFromJourneyStart: 0,
      distanceFromSiriRideStopMeters: 194,
      siriSnapshotSnapshotId: '2024/02/12/03/15',
      siriRouteId: 631,
      siriRouteLineRef: 3644,
      siriRouteOperatorRef: 3,
      siriRideId: 62029813,
      siriRideJourneyRef: '2024-02-12-7084770',
      siriRideScheduledStartTime: new Date('2024-02-12T03:20:00+00:00'),
      siriRideVehicleRef: '23304202',
      siriRideFirstVehicleLocationId: 3363688673,
      siriRideLastVehicleLocationId: 3363743871,
      siriRideDurationMinutes: 34,
      siriRideGtfsRideId: 66910631,
    },
  },
}
