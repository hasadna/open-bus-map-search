import React, { useEffect, useState } from 'react'
import { Point } from 'src/pages/RealtimeMapPage'
import { Button, Grid } from '@mui/material'
import { DivIcon } from 'leaflet'
import moment from 'moment-timezone'
import './BusToolTip.scss'

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
    getSiriRideWithRelated(
      position.point!.siri_route__id.toString(),
      position.point!.siri_ride__vehicle_ref.toString(),
      position.point!.siri_route__line_ref.toString(),
    )
      .then((siriRideRes: SiriRideWithRelatedPydanticModel) => setSiriRide(siriRideRes))
      .finally(() => setIsLoading(false))
  }, [position])
  return (
    <div className={showJson ? 'extend-for-json' : ''}>
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
        <Grid container className="tool-tip-container">
          <Grid item xs={4}>
            <h4 className="bus-icon">
              <div dangerouslySetInnerHTML={{ __html: icon.options.html as string }} />
            </h4>
          </Grid>
          <Grid item xs={8} mt={2}>
            <h4>
              {TEXTS.line} :<span>{siriRide && siriRide!.gtfsRouteRouteShortName}</span>
            </h4>
          </Grid>
          <Grid item xs={12}>
            <h4>
              {TEXTS.from} :
              <span>{siriRide && siriRide!.gtfsRouteRouteLongName?.split('<->')[0]}</span>
            </h4>
            <h4>
              {TEXTS.destination} :
              <span>{siriRide && siriRide!.gtfsRouteRouteLongName?.split('<->')[1]}</span>
            </h4>
            <h4>
              {TEXTS.velocity} :<span>{`${position.point?.velocity}  ${TEXTS.kmh}`}</span>
            </h4>

            <h4>
              {TEXTS.sample_time} :
              <span>
                {moment(position.point!.recorded_at_time as string, moment.ISO_8601)
                  .tz('Israel')
                  .format('HH:mm')}
              </span>
            </h4>
            <h4>
              {TEXTS.vehicle_ref} :<span>{position.point?.siri_ride__vehicle_ref}</span>
            </h4>
            {/*maybe option to add info like this in extend card for now I  put this condition */}
            {window.screen.height > 1100 && (
              <>
                <h4>
                  {TEXTS.drive_direction} :
                  <span>
                    ( {position.point?.bearing} {TEXTS.bearing})
                  </span>
                </h4>
                <h4>
                  {TEXTS.coords} :<span>{position.loc.join(' , ')}</span>
                </h4>
              </>
            )}
          </Grid>{' '}
        </Grid>
      )}
      <Grid item xs={3} mt={1} mb={1} className="button">
        <Button
          variant="contained"
          onClick={() => {
            setShowJson(!showJson)
          }}>
          {showJson ? TEXTS.show_card : TEXTS.show_document}
        </Button>
      </Grid>
    </div>
  )
}
