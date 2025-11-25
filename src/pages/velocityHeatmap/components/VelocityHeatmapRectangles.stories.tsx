import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse } from 'msw'
import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import type { VelocityAggregation } from '../useVelocityAggregationData'
import { VelocityHeatmapLegend } from './VelocityHeatmapLegend'
import { VelocityHeatmapRectangles } from './VelocityHeatmapRectangles'

const sampleData: VelocityAggregation[] = [
  {
    rounded_lon: 34.92,
    rounded_lat: 29.56,
    total_sample_count: 8,
    average_rolling_avg: 60.4,
    stddev_rolling_avg: 3.7,
  },
  {
    rounded_lon: 34.93,
    rounded_lat: 29.57,
    total_sample_count: 12,
    average_rolling_avg: 45.2,
    stddev_rolling_avg: 5.1,
  },
  {
    rounded_lon: 34.94,
    rounded_lat: 29.58,
    total_sample_count: 20,
    average_rolling_avg: 10.0,
    stddev_rolling_avg: 1.2,
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

const parameters = {
  msw: {
    handlers: [
      http.get(
        'https://open-bus-stride-api.hasadna.org.il/siri_velocity_aggregation/siri_velocity_aggregation',
        async () => {
          await new Promise((r) => setTimeout(r, 500)) // Simulate network delay
          return HttpResponse.json(sampleData)
        },
      ),
    ],
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
