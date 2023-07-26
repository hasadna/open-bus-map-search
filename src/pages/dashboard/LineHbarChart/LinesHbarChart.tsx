import React from 'react'
import { TEXTS } from 'src/resources/texts'
import './linesHbarChart.scss'
import { getColorByHashString } from './utils'
import cn from 'classnames'

const colorsByCompannies: { [index: string]: string } = {
  'אגד תעבורה': '#2f9250',
  אגד: '#008479',
  'אלקטרה אפיקים': '#9ACA3C',
  קווים: '#03296A',
  סופרבוס: '#164C8F',
  דן: '#205CAB',
  'נתיב אקספרס': '#F2BD00',
  מטרופולין: '#FF8500',
}

const numberFormatter = new Intl.NumberFormat('he-IL')

function getColorName(name: string) {
  return colorsByCompannies[name] || getColorByHashString(name)
}

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
    color: getColorName(o.short_name),
    percent: percents[i],
    ...o,
  }))

  return (
    <div className="lineHbarChart chart">
      {rows
        .sort((a, b) => a.percent - b.percent)
        .filter(
          (line) =>
            !operators_whitelist.length ||
            (operators_whitelist.includes(line.operator_name) && line.percent < 90),
        )
        .slice(0, 10)
        .map((line) => {
          return (
            !!line.percent && (
              <div className="line" key={getFirstNumber(line.short_name)}>
                <div
                  className="operatorName"
                  style={{ backgroundColor: getColorName(line.operator_name) }}>
                  {`${getFirstNumber(line.short_name)} | ${line.operator_name}`}
                </div>
                <div className="operatorBar">
                  <div className="operatorBarTotal">
                    <div
                      className={cn('operatorBarActual', { small: line.percent < 20 })}
                      style={{
                        width: `${line.width}%`,
                        backgroundColor: getColorName(line.operator_name),
                      }}>
                      {line.percent.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="tooltip">
                  <div className="operatorTotal">{line.long_name}</div>
                  <div className="operatorTotal">
                    {TEXTS.rides_planned}: {numberFormatter.format(line.total)}
                  </div>
                  <div className="operatorActual">
                    {TEXTS.rides_actual}: {numberFormatter.format(line.actual)}
                  </div>
                </div>
              </div>
            )
          )
        })}
    </div>
  )
}

export default LinesHbarChart
