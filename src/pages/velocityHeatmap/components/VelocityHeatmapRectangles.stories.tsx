import type { SiriVelocityAggregationPydanticModel } from '@hasadna/open-bus-api-client'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MapContainer, TileLayer } from 'react-leaflet'
import { fn } from '@storybook/test'
import * as velocityHook from '../useVelocityAggregationData'
import type { VelocityAggregation } from '../useVelocityAggregationData'
import { VelocityHeatmapLegend } from './VelocityHeatmapLegend'
import { VelocityHeatmapRectangles } from './VelocityHeatmapRectangles'

const sampleData: SiriVelocityAggregationPydanticModel[] = [
  {
    roundedLon: 34.92,
    roundedLat: 29.56,
    totalSampleCount: 8,
    averageRollingAvg: 60.4,
    stddevRollingAvg: 3.7,
  },
  {
    roundedLon: 34.93,
    roundedLat: 29.57,
    totalSampleCount: 12,
    averageRollingAvg: 45.2,
    stddevRollingAvg: 5.1,
  },
  {
    roundedLon: 34.94,
    roundedLat: 29.58,
    totalSampleCount: 20,
    averageRollingAvg: 10.0,
    stddevRollingAvg: 1.2,
  },
]

const noop = () => {}

const meta = {
  title: 'VelocityHeatmap/Rectangles',
  component: VelocityHeatmapRectangles,
  argTypes: {
    visMode: {
      control: { type: 'select' },
      options: ['avg', 'std', 'cv'],
      description:
        'Visualization mode: avg for average velocity, std for standard deviation, cv for coefficient of variation',
    },
    setMinMax: {
      control: false,
      description: 'Optional callback function to set min and max values for the legend',
      table: {
        type: { summary: '(min: number, max: number) => void) | undefined' },
      },
    },
  },
  args: {
    visMode: 'avg',
  },
  decorators: [
    (Story, ctx) => {
      return (
        <div style={{ height: '500px', width: '100%', margin: '16px 0' }}>
          <MapContainer
            center={[29.57, 34.93]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            />
            <Story
              args={{
                visMode: ctx.args.visMode,
                setMinMax: noop,
              }}
            />
            <VelocityHeatmapLegend visMode={ctx.args.visMode} min={0} max={1} />
          </MapContainer>
        </div>
      )
    },
  ],
} satisfies Meta<typeof VelocityHeatmapRectangles>

export default meta

type Story = StoryObj<typeof meta>

const mockVelocityData = {
  data: sampleData,
  loading: false,
  error: undefined,
  currZoom: 13,
}

export const Default: Story = {
  parameters: {
    eyes: {
      waitBeforeCapture: 2500,
    },
  },
  beforeEach: () => {
    vi.spyOn(velocityHook, 'useVelocityAggregationData').mockReturnValue(mockVelocityData)
    return () => {
      vi.restoreAllMocks()
    }
  },
}

export const StdDev: Story = {
  args: { visMode: 'std' },
  parameters: {
    eyes: {
      waitBeforeCapture: 2500,
    },
  },
  beforeEach: () => {
    vi.spyOn(velocityHook, 'useVelocityAggregationData').mockReturnValue(mockVelocityData)
    return () => {
      vi.restoreAllMocks()
    }
  },
}

export const CoeffOfVar: Story = {
  args: { visMode: 'cv' },
  parameters: {
    eyes: {
      waitBeforeCapture: 2500,
    },
  },
  beforeEach: () => {
    vi.spyOn(velocityHook, 'useVelocityAggregationData').mockReturnValue(mockVelocityData)
    return () => {
      vi.restoreAllMocks()
    }
  },
}
