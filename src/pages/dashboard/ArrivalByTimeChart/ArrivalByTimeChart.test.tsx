import { type RenderResult, render, screen } from '@testing-library/react'
import ArrivalByTimeChart from './ArrivalByTimeChart'
import '@testing-library/jest-dom'
import type { ReactNode } from 'react'
import testBusData from './testdata/data.json'

describe('ArrivalByTimeChart', () => {
  let renderedComponent: RenderResult

  beforeEach(() => {
    renderedComponent = render(
      <ArrivalByTimeChart data={testBusData} operatorId={testBusData[0].id} />,
    )
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
    expect(screen.getByText(testBusData[0].name)).toBeInTheDocument()
  })

  test('tooltip wrapper exists', () => {
    expect(renderedComponent.container.querySelector('.recharts-tooltip-wrapper')).not.toBeNull
  })

  test('tooltips are not visible by default', () => {
    expect(renderedComponent.container.querySelector('.recharts-tooltip-wrapper')).not.toBeVisible
  })

  test('legend wrapper exists', () => {
    expect(renderedComponent.container.querySelector('.recharts-legend-wrapper')).not.toBeVisible
  })

  test('filters operators correctly', () => {
    expect(screen.queryByText('notegged')).not.toBeInTheDocument()
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument()
  })
})
