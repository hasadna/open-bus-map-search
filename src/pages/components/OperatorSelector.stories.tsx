import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import OperatorSelector from './OperatorSelector'
import { MAJOR_OPERATORS } from 'src/model/operator'

const meta = {
  title: 'Components/OperatorSelector',
  component: OperatorSelector,
  parameters: {
    layout: 'centered',
  },
  args: {
    setOperatorId: () => {},
  },
  argTypes: {
    operatorId: {
      description: 'The ID of the selected operator.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string | undefined' },
        defaultValue: { summary: 'undefined' },
      },
    },
    setOperatorId: {
      description: 'Function to update the selected operator ID.',
      action: 'setOperatorId',
      table: {
        type: { summary: '(operatorId: string | undefined) => void' },
        defaultValue: { summary: 'undefined' },
      },
    },
    filter: {
      description: 'Filter function or criteria for the list of operators.',
      control: { type: 'object' },
      table: {
        type: { summary: ' string[]' },
        defaultValue: { summary: 'undefined' },
      },
    },
    disabled: {
      description: 'Whether the operator selector is disabled.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
  decorators: [
    (Story, meta) => {
      const [operator, setOperator] = useState<string | undefined>(meta.args.operatorId)
      return (
        <div style={{ width: '300px' }}>
          <Story
            args={{
              ...meta.args,
              operatorId: operator,
              setOperatorId: (operator) => {
                setOperator(operator)
                meta.args.setOperatorId?.(operator)
              },
            }}
          />
        </div>
      )
    },
  ],
} satisfies Meta<typeof OperatorSelector>

export default meta

type Story = StoryObj<typeof meta>

export const MarjorOperators: Story = {
  args: {
    filter: MAJOR_OPERATORS,
  },
}

export const AllOperators: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
