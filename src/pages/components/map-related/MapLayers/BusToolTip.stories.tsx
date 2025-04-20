import type { Meta, StoryObj } from '@storybook/react'
import { BrowserRouter } from 'react-router'
import { BusToolTip, BusToolTipProps } from './BusToolTip'

const meta = {
  title: 'Components/MapLayers/BusToolTip',
  component: BusToolTip,
  parameters: {
    layout: 'centered',
  },
  tags: ['map', 'tooltip', 'autodocs'],
} satisfies Meta<typeof BusToolTip>

export default meta

type Story = StoryObj<typeof meta>

const defaultArgs: BusToolTipProps = {
  position: {
    loc: [31.799982, 34.786926],
    color: 22,
    operator: 3,
    bearing: 106,
    recorded_at_time: 1698809440000,
    point: {
      id: 2838516282,
      siri_snapshot_id: 919509,
      siri_ride_stop_id: 1370461085,
      recorded_at_time: '2023-11-01T03:30:40+00:00',
      lon: 34.786926,
      lat: 31.799982,
      bearing: 106,
      velocity: 22,
      distance_from_journey_start: 636,
      distance_from_siri_ride_stop_meters: 278,
      siri_snapshot__snapshot_id: '2023/11/01/03/30',
      siri_route__id: 973,
      siri_route__line_ref: 2974,
      siri_route__operator_ref: 3,
      siri_ride__id: 52703935,
      siri_ride__journey_ref: '2023-11-01-56650774',
      siri_ride__scheduled_start_time: '2023-11-01T03:30:00+00:00',
      siri_ride__vehicle_ref: '23321002',
      siri_ride__first_vehicle_location_id: 2838509585,
      siri_ride__last_vehicle_location_id: 2838555351,
      siri_ride__duration_minutes: 27,
      siri_ride__gtfs_ride_id: 57365030,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  },
  icon: '/bus-logos/3.svg',
}

export const Default: Story = {
  args: defaultArgs,
  // Wrap the component render function with BrowserRouter
  render: (args) => (
    <BrowserRouter>
      <BusToolTip {...args} />
    </BrowserRouter>
  ),
}
