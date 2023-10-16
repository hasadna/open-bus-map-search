import React, { useEffect, useState } from 'react'
import { Point } from 'src/pages/RealtimeMapPage'
import { Button } from '@mui/material'
import moment from 'moment-timezone'
import './BusToolTip.scss'

import { getSiriRideWithRelated } from 'src/api/siriService'
import { SiriRideWithRelatedPydanticModel } from 'open-bus-stride-client/openapi/models/SiriRideWithRelatedPydanticModel'
import { TEXTS } from 'src/resources/texts'
import { Spin } from 'antd'
import cn from 'classnames'

export function BusToolTip({ position, icon }: { position: Point; icon: string }) {
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
    <div className={cn({ 'extend-for-json': showJson }, 'bus-tooltip')}>
      {isLoading ? (
        <>
          {TEXTS.loading_routes}
          <Spin />
        </>
      ) : (
        <>
          <header className="header">
            <h1 className="title">
              {TEXTS.line} :<span>{siriRide && siriRide!.gtfsRouteRouteShortName}</span>
            </h1>
            <img src={icon} alt="bus icon" className="bus-icon" />
          </header>
          <ul>
            <li>
              {TEXTS.from} :
              <span>{siriRide && siriRide!.gtfsRouteRouteLongName?.split('<->')[0]}</span>
            </li>
            <li>
              {TEXTS.destination} :
              <span>{siriRide && siriRide!.gtfsRouteRouteLongName?.split('<->')[1]}</span>
            </li>
            <li>
              {TEXTS.velocity} :<span>{`${position.point?.velocity}  ${TEXTS.kmh}`}</span>
            </li>

            <li>
              {TEXTS.sample_time} :
              <span>
                {moment(position.point!.recorded_at_time as string, moment.ISO_8601)
                  .tz('Israel')
                  .format('DD/MM/yyyy בשעה HH:mm')}
              </span>
            </li>
            <li>
              {TEXTS.vehicle_ref} :<span>{position.point?.siri_ride__vehicle_ref}</span>
            </li>
          </ul>
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
        </>
      )}
      <Button onClick={() => setShowJson((showJson) => !showJson)}>
        {showJson ? TEXTS.hide_document : TEXTS.show_document}
      </Button>
      {showJson && (
        <pre>
          {JSON.stringify(position, null, 2)}
          <br />
          {siriRide && JSON.stringify(siriRide, null, 2)}
        </pre>
      )}
    </div>
  )
}
