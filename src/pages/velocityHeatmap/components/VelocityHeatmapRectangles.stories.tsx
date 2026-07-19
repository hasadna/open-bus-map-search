import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import { MapContainer, TileLayer } from 'react-leaflet'
import { velocityAggregation } from '../../../../.storybook/mockData'
import { VelocityHeatmapLegend } from './VelocityHeatmapLegend'
import { VelocityHeatmapRectangles } from './VelocityHeatmapRectangles'

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
                setMinMax: () => {},
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

const parameters = {
  msw: {
    handlers: [
      http.get(
        'https://open-bus-stride-api.hasadna.org.il/siri_velocity_aggregation/siri_velocity_aggregation',
        () => HttpResponse.json(velocityAggregation),
      ),
    ],
  },
  eyes: {
    // Wait for the rectangles to actually render (eyes-storybook turns this selector
    // into page.waitForSelector) rather than a fixed delay that could snapshot the map
    // before the async mock data arrived.
    waitBeforeCapture: '.leaflet-overlay-pane path',
  },
}

export const Default: Story = { parameters }

export const StdDev: Story = {
  args: { visMode: 'std' },
  parameters,
}

export const CoeffOfVar: Story = {
  args: { visMode: 'cv' },
  parameters,
}
