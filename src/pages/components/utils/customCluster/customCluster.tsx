import L, { DivIcon, MarkerCluster } from 'leaflet'

const createClusterCustomIcon = (cluster: MarkerCluster): DivIcon => {
  const childCount = cluster.getChildCount()
  const imgPath = getIconForGroup(childCount)
  const className = getClassNameForGroup(childCount)

  const innerHtml = `
    <div class="marker-container">
      <span>${childCount}</span>
       <img src="${imgPath}" alt="${childCount}.svg" />
    </div>`

  return new DivIcon({
    html: innerHtml,
    className: className,
    iconSize: new L.Point(40, 40),
  })
}
export default createClusterCustomIcon

const getIconForGroup = (numOfNearbyBusses: number): string => {
  const groupSizes = [30, 10, 3, 2]

  const imgPath = process.env.PUBLIC_URL + '/bus-groups/'
  const iconName = `${groupSizes.find((groupSize) => numOfNearbyBusses >= groupSize) || 3}.svg`
  return imgPath + iconName
}

const getClassNameForGroup = (numOfNearbyBusses: number): string => {
  type groupToClassName = {
    numOfnearbyBusses: number
    className: string
  }

  const classes: groupToClassName[] = [
    { numOfnearbyBusses: 100, className: 'large' },
    { numOfnearbyBusses: 10, className: 'medium' },
    { numOfnearbyBusses: 1, className: 'small' },
  ]

  const clusterClass = 'marker-cluster marker-cluster-'
  const clusterSize =
    classes.find((groupClass) => numOfNearbyBusses >= groupClass.numOfnearbyBusses)?.className ||
    'small'

  return clusterClass + clusterSize
}
