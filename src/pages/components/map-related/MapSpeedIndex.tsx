import { useTranslation } from 'react-i18next'
import { actualRouteStopMarkerPath } from './MapContent'
import {
  SPEED_BANDS,
  speedBandLabel,
  STANDING_LABEL,
  VehicleBearingGlyph,
} from './vehicleBearingGlyph'

/**
 * Key to the ping markers' speed ramp: a ring while the bus is standing, then an arrow per
 * band, growing and filling in as it goes faster.
 *
 * Speed is deliberately not a colour. The legend above it already spends colour on telling one
 * ride's line from another, so a second meaning on the same channel would be ambiguous — and
 * unreadable for the colour blind on top of that. Size and fill say it twice instead, which is
 * what keeps the bands apart at a marker's ~12px.
 */
export function MapSpeedIndex() {
  const { t } = useTranslation()

  return (
    <div className="map-speed-index">
      <div className="map-speed-index-title">{`${t('velocity')} (${t('kmh')})`}</div>
      <div className="map-speed-index-bands">
        <div className="map-speed-index-band">
          <img src={actualRouteStopMarkerPath} alt="" />
          <bdi>{STANDING_LABEL}</bdi>
        </div>
        {SPEED_BANDS.map((band) => (
          <div className="map-speed-index-band" key={band}>
            <VehicleBearingGlyph band={band} />
            <bdi>{speedBandLabel(band)}</bdi>
          </div>
        ))}
      </div>
    </div>
  )
}
