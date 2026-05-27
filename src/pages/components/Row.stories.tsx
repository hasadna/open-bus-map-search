import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentType } from 'react'
import Widget from 'src/shared/Widget'
import { Row } from './Row'

const meta: Meta<{ items: number }> = {
  title: 'Components/Row',
  component: Row as ComponentType<{ items: number }>,
  render: ({ items }) => (
    <Widget>
      <Row>
        {Array.from({ length: items }).map((_, i) => (
          <Widget key={i}>
            <div style={{ width: 50, height: 50 }} />
          </Widget>
        ))}
      </Row>
    </Widget>
  ),
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
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
