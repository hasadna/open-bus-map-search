import { type RenderResult, render, screen } from '@testing-library/react'
import ArrivalByTimeChart from './ArrivalByTimeChart'
import '@testing-library/jest-dom'
import type { ReactElement } from 'react'
import testBusData from './testdata/data.json'

describe('ArrivalByTimeChart', () => {
  let renderedComponent: RenderResult

  vi.mock('recharts', async () => {
    const mod: typeof import('recharts') = await vi.importActual('recharts')
    return {
      ...mod,
      ResponsiveContainer: ({ children }: { children: ReactElement }) => (
        <mod.ResponsiveContainer height={300} aspect={1}>
          {children}
        </mod.ResponsiveContainer>
      ),
    }
  })

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

  test('legend wrapper exists', () => {
    expect(renderedComponent.container.querySelector('.recharts-legend-wrapper')).toBeVisible()
  })

  test('filters operators correctly', () => {
    expect(screen.queryByText('notegged')).not.toBeInTheDocument()
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument()
  })
})
