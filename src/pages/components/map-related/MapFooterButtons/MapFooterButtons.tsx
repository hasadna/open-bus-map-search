import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import './MapFooterButtons.scss'

type TMapFooterButtons = {
  currentMarkerId: number
  markerIds: number[]
  navigateToMarker: (id: number) => void
}

function MapFooterButtons({
  currentMarkerId,
  markerIds,
  navigateToMarker: navigateMarkers,
}: TMapFooterButtons) {
  const currentIndex = markerIds.indexOf(currentMarkerId)
  const rightStep = markerIds[currentIndex + 1]
  const leftStep = markerIds[currentIndex - 1]
  const leftEnable = leftStep !== undefined
  const rightEnable = rightStep !== undefined

  return (
    <div className="map-footer-buttons" dir="rtl">
      <RightOutlined
        className={`${rightEnable ? '' : 'disabled'}`}
        onClick={() => rightEnable && navigateMarkers(rightStep)}
      />
      <LeftOutlined
        className={`${leftEnable ? '' : 'disabled'}`}
        onClick={() => leftEnable && navigateMarkers(leftStep)}
      />
    </div>
  )
}

export default MapFooterButtons
