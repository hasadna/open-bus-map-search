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
    .map((p) => (complement ? 100 - p : p))
  const width = percents.map((p) => Math.max(Math.min(p, 100), 0))

  return (
    <div className="operatorRow">
      {operators
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((operator, i) => {
          return (
            <div className="operator" key={operator.name}>
              <div
                className="operatorName"
                style={{ backgroundColor: getColorName(operator.name) }}>
                {operator.name}
              </div>
              <div className="operatorBar">
                <div className="operatorBarTotal">
                  <div
                    className={cn('operatorBarActual', { small: percents[i] < 20 })}
                    style={{
                      width: `${width[i]}`,
                      backgroundColor: getColorName(operator.name),
                    }}>
                    {percents[i].toFixed(2)}%
                  </div>
                </div>
              </div>
              <div className="tooltip">
                <div className="operatorTotal">
                  {TEXTS.rides_planned}: {operator.total}
                </div>
                <div className="operatorActual">
                  {TEXTS.rides_actual}: {operator.actual}
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}

export default OperatorHbarChart
