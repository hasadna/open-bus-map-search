import React, { useEffect, useState } from 'react'
import { Point } from 'src/pages/RealtimeMapPage'
import { Button, Card, CardContent, Grid, Typography } from '@mui/material'
import { DivIcon } from 'leaflet'
import moment from 'moment-timezone'

import { getSiriRideWithRelated, getSiriStopHitTimesAsync } from 'src/api/siriService'
import { SiriRideWithRelatedPydanticModel } from 'open-bus-stride-client/openapi/models/SiriRideWithRelatedPydanticModel'
import { Row } from 'src/pages/components/Row'
import { Label } from 'src/pages/components/Label'
import { TEXTS } from 'src/resources/texts'
import { Spin } from 'antd'
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
//  siriRouteId: string,
//   vehicleRefs: string,
//   siriRouteLineRefs: string,
export function BusToolTip({ position, icon }: { position: Point; icon: DivIcon }) {
  const [siriRide, setSiriRide] = useState<SiriRideWithRelatedPydanticModel | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [showJson, setShowJson] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      getSiriRideWithRelated(
        position.point!.siri_route__id.toString(),
        position.point!.siri_ride__vehicle_ref.toString(),
        position.point!.siri_route__line_ref.toString(),
      ),
    ])
      .then(([siriRideRes]) => setSiriRide(siriRideRes))
      .finally(() => setIsLoading(false))
  }, [position])
  return (
    <Card style={showJson ? { minWidth: '30rem' } : {}}>
      <CardContent>
        {isLoading ? (
          <Row>
            <Label text={TEXTS.loading_routes} />
            <Spin />
          </Row>
        ) : showJson ? (
          <pre>
            {JSON.stringify(position, null, 2)}
            <br />
            {siriRide && JSON.stringify(siriRide, null, 2)}
          </pre>
        ) : (
          <Grid container display="flex" direction="row-reverse" justifyContent="space-between">
            <Grid item xs={4}>
              <Typography variant="h6" component="div">
                <div dangerouslySetInnerHTML={{ __html: icon.options.html as string }} />
              </Typography>
            </Grid>
            <Grid item xs={8} mt={2}>
              <Typography textAlign="start" variant="h6">
                {TEXTS.line} :
                <Typography component="span" variant="body1">
                  {siriRide && siriRide!.gtfsRouteRouteShortName}
                </Typography>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography textAlign="start" variant="h6">
                {TEXTS.from} :
                <Typography component="span" variant="body2">
                  {siriRide && siriRide!.gtfsRouteRouteLongName?.split('<->')[0]}
                </Typography>
              </Typography>
              <Typography textAlign="start" variant="h6">
                {TEXTS.destination} :
                <Typography component="span" variant="body2">
                  {siriRide && siriRide!.gtfsRouteRouteLongName?.split('<->')[1]}
                </Typography>
              </Typography>
              <Typography textAlign="start" variant="h6">
                {TEXTS.velocity} :
                <Typography component="span" variant="body2">
                  {position.point?.velocity} קמ״ש
                </Typography>
              </Typography>

              <Typography textAlign="start" variant="h6">
                {TEXTS.sample_time} :
                <Typography component="span" variant="body2">
                  {moment(position.point!.recorded_at_time as string, moment.ISO_8601)
                    .tz('Israel')
                    .format('HH:mm')}
                </Typography>
              </Typography>
              <Typography textAlign="start" variant="h6">
                {TEXTS.vehicle_ref} :
                <Typography component="span" variant="body2">
                  {position.point?.siri_ride__vehicle_ref}
                </Typography>
              </Typography>
              {/*maybe option to add info like this in extend card for now I  put this condition */}
              {window.screen.height > 1100 && (
                <>
                  <Typography textAlign="start" variant="h6">
                    {TEXTS.drive_direction} :
                    <Typography component="span" variant="body2">
                      ( {position.point?.bearing} {TEXTS.bearing})
                    </Typography>
                  </Typography>
                  <Typography textAlign="start" variant="h6">
                    {TEXTS.coords} :
                    <Typography component="span" variant="body2">
                      {position.loc.join(' , ')}
                    </Typography>
                  </Typography>
                </>
              )}
            </Grid>{' '}
          </Grid>
        )}
        <Grid item xs={3} mt={1} mb={1} sx={{ float: 'left' }}>
          <Button
            variant="contained"
            onClick={() => {
              setShowJson(!showJson)
            }}>
            {showJson ? TEXTS.show_card : TEXTS.show_document}
          </Button>
        </Grid>
      </CardContent>
    </Card>
  )
}
