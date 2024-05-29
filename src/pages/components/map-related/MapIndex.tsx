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
        <p className="map-index-item-line" style={{ backgroundColor: lineColor }}></p>
        <p className="map-index-item-icon" style={{ backgroundImage: `url(${imgSrc})` }}>
          {/* <img src={imgSrc} alt="planned route stop icon" /> */}
        </p>
      </div>
      <div className="map-index-item-title">
        <h3>{title}</h3>
      </div>
    </div>
  )
}
