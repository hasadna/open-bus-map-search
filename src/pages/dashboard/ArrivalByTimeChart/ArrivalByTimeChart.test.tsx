import { type RenderResult, render, screen } from '@testing-library/react'
import ArrivalByTimeChart from './ArrivalByTimeChart'
import type { ReactElement } from 'react'
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

describe('ArrivalByTimeChart', () => {
  let renderedComponent: RenderResult
  beforeEach(() => {
    renderedComponent = render(
      <ArrivalByTimeChart data={testBusData} operatorId={testBusData[0].id} />,
    )
  })

  test('renders without crashing', () => {
    expect(screen.getByText(testBusData[0].name)).toBeInTheDocument()
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
