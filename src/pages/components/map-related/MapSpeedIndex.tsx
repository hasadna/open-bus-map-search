import { useTranslation } from 'react-i18next'
import {
  SPEED_BANDS,
  speedBandLabel,
  STANDING_LABEL,
  VehicleBearingGlyph,
  VehicleStandingGlyph,
} from './vehicleBearingGlyph'

/**
 * Key to the ping markers' speed ramp: the compass badge for a bus reported standing, then an
 * arrow per band, growing as it goes faster and red across the slow half.
 */
export function MapSpeedIndex() {
  const { t } = useTranslation()

  return (
    <div className="map-speed-index">
      <div className="map-speed-index-title">{`${t('velocity')} (${t('kmh')})`}</div>
      <div className="map-speed-index-bands">
        <div className="map-speed-index-band">
          <VehicleStandingGlyph />
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
