import { RideExecutionPydanticModel } from '@hasadna/open-bus-api-client'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { getPastDate } from '../../../.storybook/main'
import GapsTable from './GapsTable'

const meta = {
  title: 'Components/GapsTable',
  component: GapsTable,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      const fixedDate = getPastDate()

      const RealDate = Date

      // @ts-expect-error: we're overriding global Date
      Date = class extends RealDate {
        constructor() {
          super()
          return new RealDate(fixedDate)
        }
        static now() {
          return new RealDate(fixedDate).getTime()
        }
      }
      return <Story />
    },
  ],
  argTypes: {
    gaps: {
      description: 'List of gap objects to display in the table',
      control: { type: 'object' },
      table: {
        type: { summary: 'GapsList' },
      },
    },
    loading: {
      description: 'Whether the table is in loading state',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
      },
    },
    initOnlyGapped: {
      description: 'Show only gapped rows initially',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
      },
    },
  },
} satisfies Meta<typeof GapsTable>

export default meta

type Story = StoryObj<typeof meta>

const makeTime = (hours: number = 15, minutes: number = 0) => {
  const time = new Date(getPastDate())
  time.setHours(hours)
  time.setMinutes(minutes)
  return time
}

const mockGaps: RideExecutionPydanticModel[] = [
  {
    plannedStartTime: makeTime(13),
    actualStartTime: makeTime(13),
  },
  {
    plannedStartTime: undefined,
    actualStartTime: makeTime(13),
  },
  {
    plannedStartTime: makeTime(14),
    actualStartTime: undefined,
  },
  {
    plannedStartTime: undefined,
    actualStartTime: makeTime(14, 30),
  },
  {
    plannedStartTime: makeTime(15, 30),
    actualStartTime: undefined,
  },
]

export const Default: Story = {
  args: {
    gaps: mockGaps,
  },
}

export const OnlyGappe: Story = {
  args: {
    gaps: mockGaps,
    initOnlyGapped: true,
  },
}
