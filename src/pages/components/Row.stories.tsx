import type { Meta, StoryObj } from '@storybook/react-vite'
import { Row } from './Row'
import Widget from 'src/shared/Widget'

const meta: Meta<{ items: number }> = {
  title: 'Components/Row',
  component: Row,
  parameters: {
    layout: 'centered',
  },
  args: {
    items: 3,
  },
  argTypes: {
    items: {
      control: {
        type: 'range',
        min: 1,
        max: 7,
      },
    },
  },
  decorators: [
    (Story, meta) => (
      <Widget>
        <Row>
          {Array.from({ length: meta.args.items }).map((_, i) => (
            <Widget key={i}>
              <div style={{ width: 50, height: 50 }} />
            </Widget>
          ))}
        </Row>
      </Widget>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
