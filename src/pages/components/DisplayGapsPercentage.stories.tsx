import { Meta, StoryObj } from '@storybook/react-vite'
import DisplayGapsPercentage from './DisplayGapsPercentage'

const meta = {
  title: 'Components/DisplayGapsPercentage',
  component: DisplayGapsPercentage,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DisplayGapsPercentage>

export default meta

type Story = StoryObj<typeof meta>

export const GreatGapPercentage: Story = {
  args: {
    gapsPercentage: 5,
    decentPercentage: 10,
    terriblePercentage: 15,
  },
  parameters: {
    docs: {
      description: {
        story: 'When gapsPercentage is lower than decentPercentage',
      },
    },
  },
}

export const DecentGapPercentage: Story = {
  args: {
    gapsPercentage: 12,
    decentPercentage: 10,
    terriblePercentage: 15,
  },
  parameters: {
    docs: {
      description: {
        story: 'When gapsPercentage is between decentPercentage and terriblePercentage',
      },
    },
  },
}

export const TerribleGapPercentage: Story = {
  args: {
    gapsPercentage: 17,
    decentPercentage: 10,
    terriblePercentage: 15,
  },
  parameters: {
    docs: {
      description: {
        story: 'When gapsPercentage is higher than terriblePercentage',
      },
    },
  },
}
