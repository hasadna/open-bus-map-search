import type { Meta, StoryObj } from '@storybook/react-vite'
import { mocked } from 'storybook/test'
import { getRoutesByLineRef } from 'src/api/gtfsService'
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

const mockedRoute = {
  id: 3753789,
  date: new Date('2023-11-01'),
  lineRef: 2974,
  operatorRef: 3,
  routeShortName: '1',
  routeLongName: 'שדרות מנחם בגין/כביש 7-גדרה<->שדרות מנחם בגין/כביש 7-גדרה-3#',
  routeMkt: '33001',
  routeDirection: '3',
  routeAlternative: '#',
  agencyName: 'אגד',
  routeType: '3',
}

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
  beforeEach: () => {
    mocked(getRoutesByLineRef).mockResolvedValue([mockedRoute])
  },
  args: defaultArgs,
}

export const WithComplaint: Story = {
  beforeEach: () => {
    mocked(getRoutesByLineRef).mockResolvedValue([mockedRoute])
  },
  args: defaultArgs,
  play: async ({ canvasElement, userEvent }) => {
    // Simulate typing 'complaint' to trigger the EasterEgg
    await new Promise((resolve) => setTimeout(resolve, 1000)) // wait for 1 second
    await userEvent.type(canvasElement, 'complaint')
  },
}
