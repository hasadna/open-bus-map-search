import type { Meta, StoryObj } from '@storybook/react'
import moment from 'moment'
import WorstLinesChart from './WorstLinesChart'
import { getPastDate, waitForContent } from '../../../../.storybook/utils.test'

const meta: Meta<typeof WorstLinesChart> = {
  component: WorstLinesChart,
  title: 'Pages/Dashboard/WorstLinesChart',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    startDate: {
      control: 'date',
      description: 'The start date of the chart.',
      table: {
        type: { summary: 'Moment' },
      },
    },
    endDate: {
      control: 'date',
      description: 'The end date of the chart.',
    },
    operatorId: {
      control: 'text',
      description: 'The operator id of the chart.',
    },
  },
  play: ({ canvasElement }) => waitForContent(canvasElement),
  render: (args) => (
    <div style={{ width: 700 }}>
      <WorstLinesChart
        startDate={moment(args.startDate)}
        endDate={moment(args.endDate)}
        operatorId={args.operatorId}
      />
    </div>
  ),
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDate: getPastDate(true),
    endDate: getPastDate(),
    operatorId: '3',
  },
}
