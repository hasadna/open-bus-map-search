import React from 'react'
import { TEXTS } from 'src/resources/texts'
import { getColorByHashString } from './utils'
import cn from 'classnames'
import { HbarChart } from '../HbarChart/HbarChart'
import { getColorName } from '../OperatorHbarChart/OperatorHbarChart'

const numberFormatter = new Intl.NumberFormat('he-IL')

function getFirstNumber(input: string): string | null {
  const regex = /\d+/g
  const numbers = input.match(regex)
  return numbers ? numbers[0] : null
}

function LinesHbarChart({
  lines,
  complement = false, // complement the chart (100% - actual) instead of actual
  operators_whitelist = [],
}: {
  lines: {
    id: string
    short_name: string
    long_name: string
    operator_name: string
    total: number
    actual: number
  }[]
  complement?: boolean
  operators_whitelist?: Array<string>
}) {
  const percents = lines
    .map((o) => (o.actual / o.total) * 100)
    .map((p) => (complement ? Math.max(100 - p, 0) : p))
  const width = percents.map((p) => Math.max(Math.min(p, 100), 0))

  const rows = lines.map((o, i) => ({
    width: width[i],
    percent: percents[i],
    name: `${o.short_name} | ${o.operator_name} | ${o.long_name}`,
    color: getColorName(o.operator_name),
    ...o,
  }))

  return (
    <HbarChart
      entries={rows
        .sort((a, b) => a.actual / a.total - b.actual / b.total)
        .filter((line) => line.total > 10)
        .filter(
          (line) => !operators_whitelist.length || operators_whitelist.includes(line.operator_name),
        )
        // .filter((line) => line.actual / line.total > 0.4)
        .slice(0, 200)}
      complement={complement}
    />
  )
}

export default LinesHbarChart
