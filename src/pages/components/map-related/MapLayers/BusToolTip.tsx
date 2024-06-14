import { ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Point } from 'src/pages/timeBasedMap'
import { Button } from '@mui/material'
import moment from 'moment-timezone'
import './BusToolTip.scss'
import { getSiriRideWithRelated } from 'src/api/siriService'
import { SiriRideWithRelatedPydanticModel } from 'open-bus-stride-client/openapi/models/SiriRideWithRelatedPydanticModel'
import { useTranslation } from 'react-i18next'
import CircularProgress from '@mui/material/CircularProgress'
import cn from 'classnames'
import CustomTreeView from '../../CustomTreeView'

export type BusToolTipProps = { position: Point; icon: string; children?: ReactNode }

export function BusToolTip({ position, icon, children }: BusToolTipProps) {
  const [siriRide, setSiriRide] = useState<SiriRideWithRelatedPydanticModel | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [showJson, setShowJson] = useState(false)
  const { t, i18n } = useTranslation()

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
    <div className={cn('bus-tooltip', { hebrew: i18n.language === 'he' })}>
      {isLoading || !siriRide ? (
        <div className="loading">
          <span>{t('loading_routes')}</span>
          <CircularProgress />
        </div>
      ) : (
        <>
          <header className="header">
            <h1 className="title">
              {`${t('line')}: `}
              <span>
                <Link to={`/profile/${siriRide.gtfsRideGtfsRouteId}`}>
                  {siriRide.gtfsRouteRouteShortName}
                </Link>
              </span>
            </h1>
            <img src={icon} alt="bus icon" className="bus-icon" />
          </header>
          <div className="content">
            <ul>
              <li>
                {`${t('from')}: `}
                <span>{siriRide.gtfsRouteRouteLongName?.split('<->')[0]}</span>
              </li>
              <li>
                {`${t('destination')}: `}
                <span>{siriRide.gtfsRouteRouteLongName?.split('<->')[1]}</span>
              </li>
              <li>
                {`${t('velocity')}: `}
                <span>{`${position.point?.velocity}  ${t('kmh')}`}</span>
              </li>
              <li>
                {`${t('sample_time')}: `}
                <span>
                  {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */}
                  {moment(position.point!.recorded_at_time as string, moment.ISO_8601)
                    .tz('Israel')
                    .format(`DD/MM/yyyy [${t('at_time')}] HH:mm`)}
                </span>
              </li>
              <li>
                {`${t('vehicle_ref')}: `}
                <span>{position.point?.siri_ride__vehicle_ref}</span>
              </li>
              <li>
                {`${t('drive_direction')}: `}
                <span>
                  ({position.point?.bearing} {t('bearing')})
                </span>
              </li>
              <li>
                {`${t('coords')}: `}
                <span>{position.loc.join(' ,')}</span>
              </li>
            </ul>
            <Button
              sx={i18n.language === 'he' ? { paddingLeft: 0 } : { paddingRight: 0 }}
              onClick={() => setShowJson((showJson) => !showJson)}>
              {showJson ? t('hide_document') : t('show_document')}
            </Button>
            {showJson && (
              <div onClick={(e) => e.stopPropagation()}>
                <CustomTreeView<Point>
                  id={position.point?.id + ''}
                  data={position}
                  name={t('line')}
                />
                {siriRide?.gtfsRideId && (
                  <CustomTreeView<SiriRideWithRelatedPydanticModel | undefined>
                    id={siriRide?.gtfsRideId + ''}
                    data={siriRide}
                    name={t('drive_direction')}
                  />
                )}
              </div>
            )}
          </div>
          {children}
        </>
      )}
    </div>
  )
}
