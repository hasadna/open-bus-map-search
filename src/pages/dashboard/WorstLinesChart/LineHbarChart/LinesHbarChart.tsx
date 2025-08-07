import { getColorName } from '../../AllLineschart/OperatorHbarChart/OperatorHbarChart'
import { HbarChart } from './HbarChart/HbarChart'
import { GroupByRes } from 'src/api/groupByService'

function LinesHbarChart({
  lines,
  complement = false, // complement the chart (100% - actual) instead of actual
}: {
  lines: GroupByRes[]
  complement?: boolean
  operators_whitelist?: string[]
  defaultOperators?: string[]
}) {
  const percents = lines
    .map((o) => (o.totalActualRides / o.totalRoutes) * 100)
    .map((p) => (complement ? Math.max(100 - p, 0) : p))
  const width = percents.map((p) => Math.max(Math.min(p, 100), 0))

  const rows = lines.map((o, i) => ({
    width: width[i],
    percent: percents[i],
    name: `${JSON.parse(o.routeShortName || "['']")[0]} | ${o.operatorRef?.agencyName} | ${o.routeLongName}`,
    color: getColorName(o.operatorRef?.agencyName || ''),
    ...o,
  }))

  return (
    <HbarChart
      entries={rows
        .sort((a, b) => a.totalActualRides / a.totalRoutes - b.totalActualRides / b.totalRoutes)
        .filter((line) => line.totalRoutes > 10)
        .filter((line) => line.totalActualRides / line.totalRoutes > 0.4)
        .slice(0, 200)
        .map((d) => ({
          actual: d.totalActualRides,
          name: d.name || '',
          total: d.totalRoutes,
          color: d.color,
        }))}
      complement={complement}
    />
  )
}

export default LinesHbarChart
