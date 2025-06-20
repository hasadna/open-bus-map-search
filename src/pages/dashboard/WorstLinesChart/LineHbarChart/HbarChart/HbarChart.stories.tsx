import type { Meta, StoryObj } from '@storybook/react-vite'
import { HbarChart, Entry } from './HbarChart'

const meta = {
  title: 'Pages/Dashboard/Bar/HbarChart',
  component: HbarChart,
} satisfies Meta<typeof HbarChart>

export default meta

type Story = StoryObj<typeof meta>

const operatorsPT: Entry[] = [
  {
    name: 'כפיר',
    total: 1883,
    actual: 0,
    color: '#5840c0',
  },
  {
    name: 'Unknown',
    total: 2318,
    actual: 0,
    color: '#2a443e',
  },
  {
    name: 'כרמלית',
    total: 998,
    actual: 0,
    color: '#5cbcec',
  },
  {
    name: 'כבל אקספרס',
    total: 12824,
    actual: 0,
    color: '#0d2b58',
  },
  {
    name: 'מועצה אזורית גולן',
    total: 1992,
    actual: 1506,
    color: '#957476',
  },
]

export const Chart: Story = {
  args: {
    entries: operatorsPT,
    complement: false,
  },
}
