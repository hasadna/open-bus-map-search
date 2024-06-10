export function MapIndex({
  lineColor,
  imgSrc,
  title,
}: {
  lineColor: string
  imgSrc: string
  title: string
}) {
  return (
    <div className="map-index-item">
      <div className="map-index-item-config">
        <div className="map-index-item-icon">
          <img src={imgSrc} alt="planned route stop icon" />
        </div>
        <div className="map-index-item-line" style={{ backgroundColor: lineColor }} />
      </div>
      <div className="map-index-item-title">
        <h3>{title}</h3>
      </div>
    </div>
  )
}
