import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Point } from 'src/pages/realtimeMap'
import { Button } from '@mui/material'
import moment from 'moment-timezone'
import './BusToolTip.scss'

import { getSiriRideWithRelated } from 'src/api/siriService'
import { SiriRideWithRelatedPydanticModel } from 'open-bus-stride-client/openapi/models/SiriRideWithRelatedPydanticModel'
import { useTranslation } from 'react-i18next'
import { Spin } from 'antd'
import cn from 'classnames'

export type BusToolTipProps = { position: Point; icon: string }

export function BusToolTip({ position, icon }: BusToolTipProps) {
  const [siriRide, setSiriRide] = useState<SiriRideWithRelatedPydanticModel | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [showJson, setShowJson] = useState(false)
  const { t } = useTranslation()

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
      {isLoading || !siriRide ? (
        <>
          {t('loading_routes')}
          <Spin />
        </>
      ) : (
        <>
          <header className="header">
            <h1 className="title">
              {t('line')} :
              <span>
                <Link to={`/profile/${siriRide.gtfsRouteRouteShortName}`}>
                  {siriRide.gtfsRouteRouteShortName}
                </Link>
              </span>
            </h1>
            <img src={icon} alt="bus icon" className="bus-icon" />
          </header>
          <ul>
            <li>
              {t('from')} :<span>{siriRide.gtfsRouteRouteLongName?.split('<->')[0]}</span>
            </li>
            <li>
              {t('destination')} :<span>{siriRide.gtfsRouteRouteLongName?.split('<->')[1]}</span>
            </li>
            <li>
              {t('velocity')} :<span>{`${position.point?.velocity}  ${t('kmh')}`}</span>
            </li>

            <li>
              {t('sample_time')} :
              <span>
                {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */}
                {moment(position.point!.recorded_at_time as string, moment.ISO_8601)
                  .tz('Israel')
                  .format('DD/MM/yyyy בשעה HH:mm')}
              </span>
            </li>
            <li>
              {t('vehicle_ref')} :<span>{position.point?.siri_ride__vehicle_ref}</span>
            </li>
          </ul>
          {/*maybe option to add info like this in extend card for now I  put this condition */}
          {window.screen.height > 1100 && (
            <>
              <h4>
                {t('drive_direction')} :
                <span>
                  ( {position.point?.bearing} {t('bearing')})
                </span>
              </h4>
              <h4>
                {t('coords')} :<span>{position.loc.join(' , ')}</span>
              </h4>
            </>
          )}
        </>
      )}
      <Button onClick={() => setShowJson((showJson) => !showJson)}>
        {showJson ? t('hide_document') : t('show_document')}
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
