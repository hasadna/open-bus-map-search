import React from 'react'
import './operatorsHbarChart.scss'

const colorsByCompannies: { [index: string]: string } = {
  'אגד תעבורה': 'rgb(47, 146, 80)',
  אגד: 'rgba(0, 132, 121)',
  'אלקטרה אפיקים': '#9ACA3C',
  קווים: '#03296A',
  סופרבוס: '#164C8F',
  דן: '#205CAB',
  'נתיב אקספרס': '#F2BD00',
  מטרופולין: '#FF8500',
}

function getColorByHashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).substr(-2)
  }
  return color
}

function getColorName(name: string) {
  return colorsByCompannies[name] || getColorByHashString(name)
}

function OperatorHbarChart({
  operators,
}: {
  operators: { name: string; total: number; actual: number }[]
}) {
  const percents = operators.map((o) => (o.actual / o.total) * 100)
  const width = percents.map((p) => Math.min(p, 100))

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
                    className="operatorBarActual"
                    style={{
                      width: `${width[i]}%`,
                      backgroundColor: getColorName(operator.name),
                    }}>
                    {percents[i].toFixed(2)}%
                  </div>
                </div>
              </div>
              <div className="tooltip">
                <div className="operatorTotal">נסיעות שתוכננו: {operator.total}</div>
                <div className="operatorActual">נסיעות בפועל: {operator.actual}</div>
              </div>
            </div>
          )
        })}
    </div>
  )
}

export default OperatorHbarChart
