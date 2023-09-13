import iconDefault from '../../../../resources/bus-logos/default.svg'

type OperatorId = string
type Svg = React.FunctionComponent<React.SVGAttributes<SVGElement>>
const svgsMap = new Map<OperatorId, Svg>()

const bus_logos = require.context('@bus-logos', true, /\.svg$/)
bus_logos.keys().forEach((key) => {
  const bus_logo = bus_logos(key) as Svg
  const operator_id = key.replace('.svg', '').replace('.', '').replace('/', '')
  svgsMap.set(operator_id, bus_logo)
})

function operatorIdToSvg(operator_id: number | undefined): Svg {
  if (!operator_id || !svgsMap.has(operator_id.toString())) {
    return iconDefault
  }
  return svgsMap.get(operator_id.toString())!
}

export default operatorIdToSvg
