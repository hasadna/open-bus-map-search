import type { Meta, StoryObj } from '@storybook/react'

import { LineProfileRide } from './LineProfileRide'

const meta = {
  component: LineProfileRide,
  title: 'Pages/Profile/LineProfileRide',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    point: {
      control: 'object',
      description: 'The point of the line profile.',
      table: {
        type: { summary: 'VehicleLocation' },
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
      siri_snapshot_id: 1065552,
      siri_ride_stop_id: 1601431945,
      recorded_at_time: '2024-02-12T03:15:01+00:00',
      lon: 34.984745,
      lat: 32.830078,
      bearing: 202,
      velocity: 0,
      distance_from_journey_start: 0,
      distance_from_siri_ride_stop_meters: 194,
      siri_snapshot__snapshot_id: '2024/02/12/03/15',
      siri_route__id: 631,
      siri_route__line_ref: 3644,
      siri_route__operator_ref: 3,
      siri_ride__id: 62029813,
      siri_ride__journey_ref: '2024-02-12-7084770',
      siri_ride__scheduled_start_time: '2024-02-12T03:20:00+00:00',
      siri_ride__vehicle_ref: 23304202,
      siri_ride__first_vehicle_location_id: 3363688673,
      siri_ride__last_vehicle_location_id: 3363743871,
      siri_ride__duration_minutes: 34,
      siri_ride__gtfs_ride_id: 66910631,

      siri_snapshot__created_by: '',
      siri_snapshot__error: '',
      siri_snapshot__etl_end_time: '',
      siri_snapshot__etl_start_time: '',
      siri_snapshot__etl_status: '',
      siri_snapshot__id: 0,
      siri_snapshot__last_heartbeat: '',
      siri_snapshot__num_added_siri_ride_stops: 0,
      siri_snapshot__num_added_siri_rides: 0,
      siri_snapshot__num_added_siri_routes: 0,
      siri_snapshot__num_added_siri_stops: 0,
      siri_snapshot__num_failed_parse_vehicle_locations: 0,
      siri_snapshot__num_successful_parse_vehicle_locations: 0,
    },
  },
}
