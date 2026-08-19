import type { Meta, StoryObj } from '@storybook/react-vite'
import Widget from 'src/shared/Widget'
import BusToolTipFooter from './BusToolTipFooter'

const meta = {
  component: BusToolTipFooter,
  title: 'Map/Layers/BusToolTipFooter',
  parameters: {
    layout: 'centered',
  },
  args: {
    currentMarkerId: 3,
    markerIds: [1, 2, 3, 4, 5],
    navigateToMarker: () => {},
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
} satisfies Meta<typeof BusToolTipFooter>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
