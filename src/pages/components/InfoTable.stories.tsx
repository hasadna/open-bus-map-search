import type { Meta, StoryObj } from '@storybook/react-vite'
import Widget from 'src/shared/Widget'
import * as InfoItemStories from './InfoItem.stories'
import { InfoItem, InfoTable } from './InfoTable'

const meta = {
  component: InfoTable,
  subcomponents: { InfoItem },
  title: 'Components/InfoTable',
  decorators: [
    (Story) => (
      <div dir="ltr">
        <Widget>
          <Story />
        </Widget>
      </div>
    ),
  ],
  argTypes: {
    children: {
      description: 'The content of the InfoTable',
      control: false,
      table: {
        type: { summary: '<InfoItem/>[]' },
      },
    },
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InfoTable>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: [
      <InfoItem key={1} {...InfoItemStories.Default.args} />,
      <InfoItem key={2} {...InfoItemStories.Long.args} />,
      <InfoItem key={3} {...InfoItemStories.NoValue.args} />,
    ],
  },
}
export const SingleItem: Story = {
  args: {
    children: <InfoItem label="Single Label" value="Single Value" />,
  },
}
