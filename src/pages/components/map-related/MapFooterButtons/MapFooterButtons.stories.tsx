import type { Meta, StoryObj } from '@storybook/react'
import MapFooterButtons from './MapFooterButtons'
import Widget from 'src/shared/Widget'

const meta = {
  component: MapFooterButtons,
  title: 'Map/Layers/MapFooterButtons',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    positions: [],
    index: 3,
    navigateMarkers: () => {},
  },
  decorators: [
    (Story) => (
      <Widget>
        <div dir="rtl" style={{ width: '100px' }}>
          <Story />
        </div>
      </Widget>
    ),
  ],
} satisfies Meta<typeof MapFooterButtons>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
