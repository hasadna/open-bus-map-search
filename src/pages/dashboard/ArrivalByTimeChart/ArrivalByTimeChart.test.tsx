import { type RenderResult, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import ArrivalByTimeChart, { ArrivalByTimeData } from './ArrivalByTimeChart'
import testBusData from './testdata/data.json'

jest.mock('recharts', () => {
  const original: typeof import('recharts') = jest.requireActual('recharts')
  return {
    __esModule: true,
    ...original,
    ResponsiveContainer: jest
      .fn()
      .mockImplementation(({ children }: { children: ReactElement }) => (
        <original.ResponsiveContainer height={300} aspect={1}>
          {children}
        </original.ResponsiveContainer>
      )),
  }
})
const data = testBusData.map(
  (d) => ({ ...d, gtfsRouteDate: new Date(d.gtfsRouteDate) }) as ArrivalByTimeData,
)

describe('ArrivalByTimeChart', () => {
  let renderedComponent: RenderResult
  beforeEach(() => {
    renderedComponent = render(<ArrivalByTimeChart data={data} operatorId={data[0].operatorId} />)
  })

  test('renders without crashing', () => {
    expect(screen.getByText(data[0].name)).toBeInTheDocument()
  })

  test('tooltip wrapper exists', () => {
    expect(renderedComponent.container.querySelector('.recharts-tooltip-wrapper')).not.toBeNull()
  })

  test('tooltips are not visible by default', () => {
    expect(renderedComponent.container.querySelector('.recharts-tooltip-wrapper')).not.toBeVisible()
  })
  test('filters operators correctly', () => {
    expect(screen.queryByText('notegged')).not.toBeInTheDocument()
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument()
  })
})
