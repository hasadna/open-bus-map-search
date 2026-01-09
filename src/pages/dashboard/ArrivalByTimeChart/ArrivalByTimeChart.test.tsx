import { render, type RenderResult, screen } from '@testing-library/react'
import ArrivalByTimeChart, { ArrivalByTimeData } from './ArrivalByTimeChart'
import testBusData from './testdata/data.json'

jest.mock('recharts', () => ({
  CartesianGrid: jest.fn().mockImplementation(() => <div data-testid="cartesian-grid" />),
  Line: jest.fn().mockImplementation(() => <div data-testid="line" />),
  LineChart: jest
    .fn()
    .mockImplementation(({ children }) => <div data-testid="line-chart">{children}</div>),
  ResponsiveContainer: jest
    .fn()
    .mockImplementation(({ children }) => <div data-testid="responsive-container">{children}</div>),
  Tooltip: jest
    .fn()
    .mockImplementation(() => (
      <div className="recharts-tooltip-wrapper" data-testid="tooltip" style={{ display: 'none' }} />
    )),
  XAxis: jest.fn().mockImplementation(() => <div data-testid="x-axis" />),
  YAxis: jest.fn().mockImplementation(() => <div data-testid="y-axis" />),
}))
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
