import React from 'react'
import { Point } from 'src/pages/RealtimeMapPage'
import { Card, CardContent, Grid, Typography } from '@mui/material'
import { DivIcon } from 'leaflet'
//{
//     "loc": [
//         32.224567,
//         34.830898
//     ],
//     "color": 97,
//     "operator": 3,
//     "bearing": 191,
//     "recorded_at_time": 1682931622000,
//     "point": {
//         "id": 1981609473,
//         "siri_snapshot_id": 658007,
//         "siri_ride_stop_id": 968055722,
//         "recorded_at_time": "2023-05-01T09:00:22+00:00",
//         "lon": 34.830898,
//         "lat": 32.224567,
//         "bearing": 191,
//         "velocity": 97,
//         "distance_from_journey_start": 95389,
//         "distance_from_siri_ride_stop_meters": 11513,
//         "siri_snapshot__id": 658007,
//         "siri_snapshot__snapshot_id": "2023/05/01/09/00",
//         "siri_snapshot__etl_status": "loaded",
//         "siri_snapshot__etl_start_time": "2023-05-01T09:01:07.600557+00:00",
//         "siri_snapshot__etl_end_time": "2023-05-01T09:02:02.884330+00:00",
//         "siri_snapshot__error": "",
//         "siri_snapshot__num_successful_parse_vehicle_locations": 5541,
//         "siri_snapshot__num_failed_parse_vehicle_locations": 52,
//         "siri_snapshot__num_added_siri_rides": 183,
//         "siri_snapshot__num_added_siri_ride_stops": 2615,
//         "siri_snapshot__num_added_siri_routes": 0,
//         "siri_snapshot__num_added_siri_stops": 0,
//         "siri_snapshot__last_heartbeat": "2023-05-01T09:01:47.190618+00:00",
//         "siri_snapshot__created_by": "siri-etl-7d6b95c8bb-f4fqh",
//         "siri_ride__id": 37248601,
//         "siri_ride__journey_ref": "2023-05-01-20766070",
//         "siri_ride__scheduled_start_time": "2023-05-01T07:30:00+00:00",
//         "siri_ride__vehicle_ref": "7687169",
//         "siri_ride__first_vehicle_location_id": 1981130688,
//         "siri_ride__last_vehicle_location_id": 1981750968,
//         "siri_ride__duration_minutes": 116,
//         "siri_ride__gtfs_ride_id": 40253487,
//         "siri_route__id": 1603,
//         "siri_route__line_ref": 6921,
//         "siri_route__operator_ref": 3
//     }
// }
export function BusToolTip({ position, icon }: { position: Point; icon: DivIcon }) {
  console.log(position)
  console.log(icon.options.html)
  return (
    <Card>
      <CardContent>
        <Grid container display="flex" direction="row-reverse" justifyContent="space-between">
          <Grid item xs={2}>
            <Typography variant="h6" component="div">
              <div dangerouslySetInnerHTML={{ __html: icon.options.html as string }} />
            </Typography>
          </Grid>
          <Grid item xs={10} mt={2}>
            <Typography textAlign="start" variant="h6">
              קו :
              <Typography component="span" variant="body2">
                {position.point?.siri_route__id}
              </Typography>
            </Typography>
            <Typography textAlign="start" variant="h6">
              מהירות :
              <Typography component="span" variant="body2">
                {position.point?.velocity} קמ״ש
              </Typography>
            </Typography>
            <Typography textAlign="start" variant="h6">
              כיוון נסיעה :
              <Typography component="span" variant="body2">
                ( {position.point?.bearing} מעלות)
              </Typography>
            </Typography>
            <Typography textAlign="start" variant="h6">
              זמן דגימה :
              <Typography component="span" variant="body2">
                {position.point?.recorded_at_time.split('+')[0].replace('T', ' , ').slice(0, -3)}
              </Typography>
            </Typography>
            <Typography textAlign="start" variant="h6">
              לוחית רישוי :
              <Typography component="span" variant="body2">
                {position.point?.siri_ride__vehicle_ref}
              </Typography>
            </Typography>
            <Typography textAlign="start" variant="h6">
              נ.צ:
              <Typography component="span" variant="body2">
                {position.loc.join(' , ')}
              </Typography>
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
