import type { Meta, StoryObj } from '@storybook/react'
import { VersionInfo } from './VersionInfo'

const meta: Meta<typeof VersionInfo> = {
  title: 'Pages/About/VersionInfo',
  component: VersionInfo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Displays version information for the application.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
