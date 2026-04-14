import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import type { Point } from '../map-types'
import './MapFooterButtons.scss'

type TMapFooterButtons = {
  index: number
  positions: Point[]
  navigateMarkers: (id: number) => void
}

function MapFooterButtons({ index, positions, navigateMarkers }: Readonly<TMapFooterButtons>) {
  const rightStep = index + 1
  const leftStep = index - 1

  const checkIfValidStep = (i: number) => {
    return Boolean(positions.at(i))
  }

  return (
    <div className="map-footer-buttons">
      <RightOutlined
        title={'right-chevron'}
        className={`${checkIfValidStep(rightStep) ? '' : 'disabled'}`}
        onClick={() => navigateMarkers(rightStep)}
      />
      <LeftOutlined
        title={'left-chevron'}
        className={`${checkIfValidStep(leftStep) ? '' : 'disabled'}`}
        onClick={() => navigateMarkers(leftStep)}
      />
    </div>
  )
}

export default MapFooterButtons
