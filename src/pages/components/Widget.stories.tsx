import type { Meta, StoryObj } from '@storybook/react'
import { BusToolTip } from './map-related/MapLayers/BusToolTip'
import '../../shared/shared.css'
import Widget from 'src/shared/Widget'
const meta = {
  title: 'Components/Widget',
  component: () => (
    <div style={{ background: '#f0f2f5', width: '400px', padding: '20px' }}>
      <Widget>
        שלום חברים!
        <br />
        ככה נראה widget util
      </Widget>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof BusToolTip>

export default meta

type Story = StoryObj<typeof meta>

const defaultArgs = {}

export const Default: Story = {
  args: defaultArgs,
}
