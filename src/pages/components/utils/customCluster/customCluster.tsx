import L, { DivIcon, MarkerCluster } from 'leaflet'

const createClusterCustomIcon = (cluster: MarkerCluster): DivIcon => {
  const childCount = cluster.getChildCount()
  const imgPath = getIconForGroup(childCount)
  const className = getClassNameForGroup(childCount)

  const innerHtml = `
    <div class="marker-container">
      <span>${childCount}</span>
       <img src="${imgPath}" alt="haha" />
    </div>`

  return new DivIcon({
    html: innerHtml,
    className: className,
    iconSize: new L.Point(40, 40),
  })
}
export default createClusterCustomIcon

const getIconForGroup = (groupSize: number): string => {
  const imgPath = process.env.PUBLIC_URL + '/bus-groups/'

  type groupsToImg = {
    readonly [index: number]: string
  }

  const groups: groupsToImg = {
    2: '2.svg',
    3: '3.svg',
    10: '10.svg',
    30: '30.svg',
  }

  let icon = ''

  for (const i of Object.keys(groups)) {
    const numOfNearbyBusses = parseInt(i)
    if (groupSize >= numOfNearbyBusses) {
      icon = groups[numOfNearbyBusses]
    }
  }
  return imgPath + icon
}

const getClassNameForGroup = (groupSize: number): string => {
  type groupToClassName = {
    readonly [index: number]: string
  }

  const classes: groupToClassName = {
    1: 'small',
    10: 'mediul',
    100: 'large',
  }

  const clusterClass = 'marker-cluster marker-cluster-'
  let clusterSize = ''

  for (const i of Object.keys(classes)) {
    const numOfNearbyBusses = parseInt(i)
    if (groupSize >= numOfNearbyBusses) {
      clusterSize = classes[numOfNearbyBusses]
    }
  }

  return clusterClass + clusterSize
}
