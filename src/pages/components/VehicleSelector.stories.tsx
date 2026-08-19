import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import VehicleSelector from './VehicleSelector'

const meta = {
  title: 'Components/VehicleSelector',
  component: VehicleSelector,
  parameters: {
    layout: 'centered',
  },
  args: {
    vehicleNumber: undefined,
    setVehicleNumber: () => {},
  },
  argTypes: {
    vehicleNumber: {
      description: 'The currently selected vehicle number (digits only).',
      control: { type: 'number' },
      table: {
        type: { summary: 'number | undefined' },
        defaultValue: { summary: 'undefined' },
      },
    },
    setVehicleNumber: {
      description: 'Called (debounced) with the parsed vehicle number as the user types.',
      action: 'setVehicleNumber',
      table: {
        type: { summary: '(vehicleNumber: number) => void' },
      },
    },
    disabled: {
      description: 'Whether the vehicle selector is disabled.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
  decorators: [
    (Story, ctx) => {
      const [vehicle, setVehicle] = useState<number | undefined>(ctx.args.vehicleNumber)
      return (
        <div style={{ width: '300px' }}>
          <Story
            args={{
              ...ctx.args,
              vehicleNumber: vehicle,
              setVehicleNumber: (value) => {
                setVehicle(value)
                ctx.args.setVehicleNumber?.(value)
              },
            }}
          />
        </div>
      )
    },
  ],
} satisfies Meta<typeof VehicleSelector>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const WithValue: Story = {
  args: {
    vehicleNumber: 7489226,
  },
}

export const Disabled: Story = {
  args: {
    vehicleNumber: 7489226,
    disabled: true,
  },
}
