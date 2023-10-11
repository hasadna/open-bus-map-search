import React, { useEffect, useState } from 'react'
import { Point } from 'src/pages/RealtimeMapPage'
import { Button, Card, CardContent, Grid, Typography } from '@mui/material'
import { DivIcon } from 'leaflet'
import moment from 'moment-timezone'

import { getSiriRideWithRelated } from 'src/api/siriService'
import { SiriRideWithRelatedPydanticModel } from 'open-bus-stride-client/openapi/models/SiriRideWithRelatedPydanticModel'
import { Row } from 'src/pages/components/Row'
import { Label } from 'src/pages/components/Label'
import { TEXTS } from 'src/resources/texts'
import { Spin } from 'antd'

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
