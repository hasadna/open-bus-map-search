import type { Meta, StoryObj } from '@storybook/react'
import { BusToolTip } from './MapLayers/BusToolTip'
import '../dashboard/DashboardPage.scss'
const meta = {
  title: 'Components/Widget',
  component: () => (
    <div style={{ background: '#f0f2f5', width: '400px', padding: '20px' }}>
      <div className="widget">
        שלום חברים!
        <br />
        ככה נראה widget util
      </div>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
  tags: ['map', 'tooltip', 'autodocs'],
} satisfies Meta<typeof BusToolTip>

export default meta

type Story = StoryObj<typeof meta>

const defaultArgs = {}

export const Default: Story = {
  args: defaultArgs,
}
