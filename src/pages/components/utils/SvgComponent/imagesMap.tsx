import icon2 from '../../../../resources/bus-logos/2.svg'
import icon3 from '../../../../resources/bus-logos/3.svg'
import icon4 from '../../../../resources/bus-logos/4.svg'
import icon5 from '../../../../resources/bus-logos/5.svg'
import icon6 from '../../../../resources/bus-logos/6.svg'
import icon7 from '../../../../resources/bus-logos/7.svg'
import icon8 from '../../../../resources/bus-logos/8.svg'
import icon10 from '../../../../resources/bus-logos/10.svg'
import icon14 from '../../../../resources/bus-logos/14.svg'
import icon15 from '../../../../resources/bus-logos/15.svg'
import icon16 from '../../../../resources/bus-logos/16.svg'
import icon18 from '../../../../resources/bus-logos/18.svg'
import icon20 from '../../../../resources/bus-logos/20.svg'
import icon21 from '../../../../resources/bus-logos/21.svg'
import icon23 from '../../../../resources/bus-logos/23.svg'
import icon24 from '../../../../resources/bus-logos/24.svg'
import icon25 from '../../../../resources/bus-logos/25.svg'
import icon31 from '../../../../resources/bus-logos/31.svg'
import icon32 from '../../../../resources/bus-logos/32.svg'
import icon34 from '../../../../resources/bus-logos/34.svg'
import icon35 from '../../../../resources/bus-logos/35.svg'
import icon37 from '../../../../resources/bus-logos/37.svg'
import icon38 from '../../../../resources/bus-logos/38.svg'
import icon42 from '../../../../resources/bus-logos/42.svg'
import icon44 from '../../../../resources/bus-logos/44.svg'
import icon45 from '../../../../resources/bus-logos/45.svg'
import icon47 from '../../../../resources/bus-logos/47.svg'
import icon49 from '../../../../resources/bus-logos/49.svg'
import icon50 from '../../../../resources/bus-logos/50.svg'
import icon51 from '../../../../resources/bus-logos/51.svg'
import icon91 from '../../../../resources/bus-logos/91.svg'
import icon93 from '../../../../resources/bus-logos/93.svg'
import icon97 from '../../../../resources/bus-logos/97.svg'
import icon98 from '../../../../resources/bus-logos/98.svg'
import iconDefault from '../../../../resources/bus-logos/default.svg'

type OperatorId = string | number
type Svg = React.FunctionComponent<React.SVGAttributes<SVGElement>>
const svgsMap = new Map<OperatorId, Svg>([
  [2, icon2],
  [3, icon3],
  [4, icon4],
  [5, icon5],
  [6, icon6],
  [7, icon7],
  [8, icon8],
  [10, icon10],
  [14, icon14],
  [15, icon15],
  [16, icon16],
  [18, icon18],
  [20, icon20],
  [21, icon21],
  [23, icon23],
  [24, icon24],
  [25, icon25],
  [31, icon31],
  [32, icon32],
  [34, icon34],
  [35, icon35],
  [37, icon37],
  [38, icon38],
  [42, icon42],
  [44, icon44],
  [45, icon45],
  [47, icon47],
  [49, icon49],
  [50, icon50],
  [51, icon51],
  [91, icon91],
  [93, icon93],
  [97, icon97],
  [98, icon98],
  ['default', iconDefault],
])
function operatorIdToSvg(operator_id: number | undefined): Svg {
  if (!operator_id || !svgsMap.has(operator_id)) {
    return iconDefault
  }
  return svgsMap.get(operator_id)!
}

export default operatorIdToSvg
