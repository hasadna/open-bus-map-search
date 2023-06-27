import React from 'react'
import { TEXTS } from 'src/resources/texts'
import './operatorsHbarChart.scss'
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

function OperatorHbarChart({
  operators,
  complement = false, // complement the chart (100% - actual) instead of actual
}: {
  operators: { name: string; total: number; actual: number }[]
  complement?: boolean
}) {
  const percents = operators
    .map((o) => (o.actual / o.total) * 100)
    .map((p) => (complement ? Math.max(100 - p, 0) : p))
  const width = percents.map((p) => Math.max(Math.min(p, 100), 0))

  const rows = operators.map((o, i) => ({
    width: width[i],
    color: getColorName(o.name),
    percent: percents[i],
    ...o,
  }))

  return (
    <div className="operatorHbarChart chart">
      {rows
        .sort((a, b) => b.total - a.total)
        .map((operator) => {
          return (
            !!operator.percent && (
              <div className="operator" key={operator.name}>
                <div
                  className="operatorName"
                  style={{ backgroundColor: getColorName(operator.name) }}>
                  {operator.name}
                </div>
                <div className="operatorBar">
                  <div className="operatorBarTotal">
                    <div
                      className={cn('operatorBarActual', { small: operator.percent < 20 })}
                      style={{
                        width: `${operator.width}%`,
                        backgroundColor: getColorName(operator.name),
                      }}>
                      {operator.percent.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="tooltip">
                  <div className="operatorTotal">
                    {TEXTS.rides_planned}: {numberFormatter.format(operator.total)}
                  </div>
                  <div className="operatorActual">
                    {TEXTS.rides_actual}: {numberFormatter.format(operator.actual)}
                  </div>
                </div>
              </div>
            )
          )
        })}
    </div>
  )
}

export default OperatorHbarChart
