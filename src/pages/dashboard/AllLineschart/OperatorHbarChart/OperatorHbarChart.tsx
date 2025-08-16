import './operatorsHbarChart.scss'
import { HbarChart } from '../../WorstLinesChart/LineHbarChart/HbarChart/HbarChart'
import { getColorByHashString } from './utils'

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

const excludeOperators = [/רכבת ישראל/, /^מוניות.*/, /^ירושלים-.*/, /^ירושלים -.*/]

export function getColorName(name: string) {
  return colorsByCompannies[name] || getColorByHashString(name)
}

function OperatorHbarChart({
  operators,
  complement = false, // complement the chart (100% - actual) instead of actual
}: {
  operators: { name: string; total: number; actual: number }[]
  complement?: boolean
}) {
  const rows = operators

  return (
    <HbarChart
      entries={rows
        .map((operator) => ({
          ...operator,
          color: getColorName(operator.name),
        }))
        .filter((operator) => !excludeOperators.some((pattern) => pattern.test(operator.name)))
        .sort((a, b) =>
          complement
            ? b.actual / b.total - a.actual / a.total
            : a.actual / a.total - b.actual / b.total,
        )
        .slice(0, 100)}
      complement={complement}
    />
  )
}

export default OperatorHbarChart
