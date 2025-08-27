import { GtfsRoutePydanticModel } from '@hasadna/open-bus-api-client'
import { Button, CircularProgress } from '@mui/material'
import { Skeleton } from 'antd'
import cn from 'classnames'
import { ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { EasterEgg } from '../../../EasterEgg/EasterEgg'
import CustomTreeView from '../../CustomTreeView'
import './BusToolTip.scss'
import ComplaintModal from './ComplaintModal'
import { getRoutesByLineRef } from 'src/api/gtfsService'
import dayjs from 'src/dayjs'
import { routeStartEnd, vehicleIDFormat } from 'src/pages/components/utils/rotueUtils'
import type { Point } from 'src/pages/timeBasedMap'

export type BusToolTipProps = { position: Point; icon: string; children?: ReactNode }

export function BusToolTip({ position, icon, children }: BusToolTipProps) {
  const [route, setRoute] = useState<GtfsRoutePydanticModel>()
  const [isLoading, setIsLoading] = useState(false)
  const [showJson, setShowJson] = useState(false)
  const { t, i18n } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!position.point?.id) return
    setIsLoading(true)
    getRoutesByLineRef(
      position.point?.siri_route__operator_ref.toString(),
      position.point?.siri_route__line_ref.toString(),
      new Date(position.point?.siri_ride__scheduled_start_time),
    )
      .then((routes) => {
        setRoute(routes[0])
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching routes:', error)
        setIsLoading(false)
      })
  }, [position.point?.id])

  function getDirectionFromAngle(angle: number): string {
    // Normalize the angle to the range 0-360
    angle = ((angle % 360) + 360) % 360
    // Define the cardinal directions in clockwise order
    const directions: string[] = [
      t('directions.North', { defaultValue: 'North' }),
      t('directions.Northeast', { defaultValue: 'Northeast' }),
      t('directions.East', { defaultValue: 'East' }),
      t('directions.Southeast', { defaultValue: 'Southeast' }),
      t('directions.South', { defaultValue: 'South' }),
      t('directions.Southwest', { defaultValue: 'Southwest' }),
      t('directions.West', { defaultValue: 'West' }),
      t('directions.Northwest', { defaultValue: 'Northwest' }),
    ]
    // Divide the angle into 8 equal sections (45 degrees each)
    const index: number = Math.round(angle / 45) % 8

    return directions[index]
  }

  const [from, destination] = routeStartEnd(route?.routeLongName)

  return (
    <div className={cn('bus-tooltip', { hebrew: i18n.language === 'he' })}>
      {isLoading || !route ? (
        <div>
          <h1 className="loading title">
            <span>{t('loading_routes')}</span>
            <CircularProgress />
          </h1>
          <Skeleton title={false} paragraph={{ rows: 7 }} />
        </div>
      ) : (
        <>
          <header className="header">
            <h1 className="title">
              {`${t('line')}: `}
              <span>
                <Link to={`/profile/${route.id}`}>{route?.routeShortName || 'NaN'}</Link>
              </span>
            </h1>
            <Link to={`/operator?operatorId=${position.point?.siri_route__operator_ref}`}>
              <img src={icon} alt="bus icon" className="bus-icon" />
            </Link>
          </header>
          <div className="content">
            <ul>
              <li>
                {`${t('lineProfile.agencyName')}: `}

                <span>
                  <Link to={`/operator?operatorId=${position.point?.siri_route__operator_ref}`}>
                    {route.agencyName}
                  </Link>
                </span>
              </li>
              <li>
                {`${t('from')}: `}
                <span>{from}</span>
              </li>
              <li>
                {`${t('destination')}: `}
                <span>{destination}</span>
              </li>
              <li>
                {`${t('velocity')}: `}
                <span>{`${position.point?.velocity} ${t('kmh')}`}</span>
              </li>
              <li>
                {`${t('sample_time')}: `}
                <span>
                  {dayjs(position.point!.recorded_at_time)
                    .tz('Israel')
                    .format(`l [${t('at_time')}] LT`)}
                </span>
              </li>
              <li>
                {`${t('vehicle_ref')}: `}
                <span>{vehicleIDFormat(position.point?.siri_ride__vehicle_ref)}</span>
              </li>
              <li>
                {`${t('drive_direction')}: `}
                <span>
                  {/* ({position.point?.bearing} {t('bearing')}) */}
                  {position.point?.bearing} {t('bearing')} (
                  {position.point?.bearing !== undefined
                    ? getDirectionFromAngle(position.point.bearing)
                    : t('unknown', { defaultValue: 'unknown' })}
                  )
                </span>
              </li>
              <li>
                {`${t('coords')}: `}
                <span>{position.loc.join(' ,')}</span>
              </li>
            </ul>
            <Button
              href="https://www.gov.il/BlobFolder/generalpage/gtfs_general_transit_feed_specifications/he/GTFS_Developer_Information_2024.11.21b.pdf"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ marginTop: '2px' }}>
              {t('homepage.manual')}
            </Button>
            <br />
            <Button sx={{ margin: '2px 0' }} onClick={() => setShowJson((showJson) => !showJson)}>
              {showJson ? t('hide_document') : t('show_document')}
            </Button>
            {/* Open Complaint Button */}
            <EasterEgg code="complaint">
              <Button
                variant="contained"
                color="success"
                onClick={() => setModalOpen((prev) => !prev)}
                style={{ borderRadius: '50px' }}>
                {t('open_complaint')}
              </Button>
            </EasterEgg>

            {/* Complaint Modal */}
            <ComplaintModal modalOpen={modalOpen} setModalOpen={setModalOpen} position={position} />

            {showJson && (
              <div dir={i18n.language === 'en' ? 'rtl' : 'ltr'}>
                <CustomTreeView<Point>
                  id={`${position.point?.id}`}
                  data={position}
                  name={t('line')}
                />
                {route?.id && (
                  <CustomTreeView<GtfsRoutePydanticModel>
                    id={route?.id.toString()}
                    data={route}
                    name={t('plannedRoute')}
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
