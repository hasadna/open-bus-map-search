import { render, screen } from '@testing-library/react'
import ArrivalByTimeChart from './ArrivalByTimeChart'
import '@testing-library/jest-dom'
import { ReactNode } from 'react'
import testBusData from './testdata/data.json'

describe('ArrivalByTimeChart', () => {
  interface Data {
    id: string
    name: string
    current: number
    max: number
    percent: number
    gtfs_route_date: string
    gtfs_route_hour: string
  }

  let testData: Data[]

  beforeAll(() => {
    testData = testBusData
  })

  // Mock ResponsiveContainer to have a static size otherwise it doesn't render in the unit test
  vi.mock('recharts', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Recharts = require('recharts')

    return {
      ...Recharts,
      ResponsiveContainer: ({ children }: { children: ReactNode }) => (
        <Recharts.ResponsiveContainer width={800} height={800}>
          {children}
        </Recharts.ResponsiveContainer>
      ),
    }
  })

  test('renders without crashing', () => {
    render(<ArrivalByTimeChart data={testData} operatorId={testData[0].id} />)

    expect(screen.getByText(testData[0].name)).toBeInTheDocument()
  })

  test('tooltip wrapper exists', () => {
    render(<ArrivalByTimeChart data={testData} operatorId={testData[0].id} />)
    expect(document.querySelector('.recharts-tooltip-wrapper')).not.toBeNull
  })

  test('tooltips are not visible by default', () => {
    render(<ArrivalByTimeChart data={testData} operatorId={testData[0].id} />)
    expect(document.querySelector('.recharts-tooltip-wrapper')).not.toBeVisible
  })

  test('legend wrapper exists', () => {
    render(<ArrivalByTimeChart data={testData} operatorId={testData[0].id} />)
    expect(document.querySelector('.recharts-legend-wrapper')).not.toBeVisible
  })

  test('filters operators correctly', () => {
    render(<ArrivalByTimeChart data={testData} operatorId={testData[0].id} />)

    expect(screen.queryByText('notegged')).not.toBeInTheDocument()
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument()
  })
})
