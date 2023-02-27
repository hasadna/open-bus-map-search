import React from 'react'
import './operatorsHbarChart.scss'
const minWidth = 10

function getRandomColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function OperatorHbarChart({
  operators,
}: {
  operators: { name: string; total: number; actual: number }[]
}) {
  const percents = operators.map((o) => (o.actual / o.total) * 100)
  //   const width = percents.map(
  //     (p) =>
  //       ((p - Math.min(...percents)) / (Math.max(...percents) - Math.min(...percents))) *
  //         (100 - minWidth) +
  //       minWidth,
  //   )
  const width = percents
  return (
    <div className="operatorRow">
      {operators.map((operator, i) => {
        return (
          <div className="operator" key={operator.name}>
            <div className="operatorName">{operator.name}</div>
            <div className="operatorBar">
              <div className="operatorBarTotal">
                <div
                  className="operatorBarActual"
                  style={{ width: `${width[i]}%`, backgroundColor: getRandomColor() }}>
                  {percents[i].toFixed(2)}%
                </div>
              </div>
            </div>
            <div className="operatorTotal">{operator.total}</div>
            <div className="operatorActual">{operator.actual}</div>
          </div>
        )
      })}
    </div>
  )
}

export default OperatorHbarChart
