// CustomTreeView.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import CustomTreeView from './CustomTreeView';
import '../../shared/shared.css'; // Assuming you have some shared styles

// Define a base type for your tree nodes, considering the object structure you provided earlier
interface CustomTreeNode {
  id: string;
  name: string;
  children?: CustomTreeNode[];
}

// Example data for the story
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
};

const meta: Meta<typeof CustomTreeView> = {
  title: 'Components/CustomTreeView',
  component: CustomTreeView,
  parameters: {
    layout: 'centered',
  },
  tags: ['tree', 'view', 'react', 'mui'], // Adjust tags as needed
} satisfies Meta<typeof CustomTreeView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: exampleData, // Using the example data for the default story
  },
};
