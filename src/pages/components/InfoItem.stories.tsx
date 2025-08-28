import type { Meta, StoryObj } from '@storybook/react-vite'
import Widget from 'src/shared/Widget'
import { InfoItem, InfoTable } from './InfoTable'

const meta = {
  component: InfoItem,
  title: 'Components/InfoTable/InfoItem',
  args: { label: 'Label' },
  argTypes: {
    label: {
      description: 'The label of the InfoItem',
      control: {
        type: 'text',
      },
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
    value: {
      description: 'The value of the InfoItem',
      control: {
        type: 'text',
      },
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
  },
  decorators: [
    (Story) => (
      <div dir="ltr">
        <Widget>
          <InfoTable>
            <Story />
          </InfoTable>
        </Widget>
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InfoItem>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Label', value: 'Value' },
}

export const Long: Story = {
  args: {
    label: 'Long Label',
    value: 'This is a very long value that might wrap to multiple lines',
  },
}

export const NoValue: Story = {
  args: { label: 'No Value' },
}
