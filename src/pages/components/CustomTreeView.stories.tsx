import type { Meta, StoryObj } from '@storybook/react-vite'
import CustomTreeView from './CustomTreeView'

const exampleData = {
  id: 'root',
  name: 'Root Node',
  children: [
    {
      id: '1',
      name: 'Child Node 1',
      children: [
        { id: '1-1', name: 'Grandchild Node 1-1' },
        { id: '1-2', name: 'Grandchild Node 1-2' },
      ],
    },
    {
      id: '2',
      name: 'Child Node 2',
    },
  ],
}

const meta = {
  title: 'Components/CustomTreeView',
  component: CustomTreeView,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CustomTreeView>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'exampleData',
    name: 'exampleData',
    data: exampleData,
  },
}
