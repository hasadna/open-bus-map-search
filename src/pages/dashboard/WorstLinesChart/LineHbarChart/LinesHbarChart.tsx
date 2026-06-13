import { getColorName } from '../../AllLineschart/OperatorHbarChart/OperatorHbarChart'
import { HbarChart } from './HbarChart/HbarChart'

export type LineBar = {
  id: string
  short_name: string
  long_name: string
  operator_name: string
  total: number
  actual: number
}

function LinesHbarChart({
  lines,
  complement = false, // complement the chart (100% - actual) instead of actual
}: {
  lines: LineBar[]
  complement?: boolean
  operators_whitelist?: string[]
  defaultOperators?: string[]
}) {
  const percents = lines.map((line) =>
    complement
      ? Math.max(100 - (line.actual / line.total) * 100, 0)
      : (line.actual / line.total) * 100,
  )

  const width = percents.map((percent) => Math.max(Math.min(percent, 100), 0))

  const rows = lines.map((line, index) => ({
    width: width[index],
    percent: percents[index],
    name: `${line.short_name} | ${line.operator_name} | ${line.long_name}`,
    color: getColorName(line.operator_name),
    ...line,
  }))

  return (
    <HbarChart
      entries={rows
        .sort((a, b) => a.percent - b.percent)
        .filter((line) => line.total > 10)
        .filter((line) => line.percent > 40)
        .slice(0, 200)}
      complement={complement}
    />
  )
}

export default LinesHbarChart
