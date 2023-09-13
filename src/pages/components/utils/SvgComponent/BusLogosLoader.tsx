import iconDefault from '../../../../resources/bus-logos/default.svg'

type Svg = React.FunctionComponent<React.SVGAttributes<SVGElement>>
const svgsMap = new Map<string, Svg>()

const bus_logos = require.context('@bus-logos', true, /\.svg$/)
bus_logos.keys().forEach((key) => {
  const regex = /([0-9]+)|(?:default)/ //get only the operator id or 'default' from the filename

  if (regex.test(key)) {
    const operator_id = key.match(regex)![0]
    const bus_logo = bus_logos(key) as Svg
    svgsMap.set(operator_id as string, bus_logo)
  }
})

export default function operatorIdToSvg(operator_id: number | undefined): Svg {
  if (!operator_id || !svgsMap.has(operator_id.toString())) {
    return iconDefault
  }
  return svgsMap.get(operator_id.toString())!
}
