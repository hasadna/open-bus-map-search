import { useTranslation } from 'react-i18next'
import {
  SPEED_BANDS,
  speedBandLabel,
  STANDING_LABEL,
  VehicleBearingGlyph,
  VehicleStandingGlyph,
} from './vehicleBearingGlyph'

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
