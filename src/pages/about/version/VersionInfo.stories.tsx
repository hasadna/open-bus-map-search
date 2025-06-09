import type { Meta, StoryObj } from '@storybook/react'
import { VersionInfo } from './VersionInfo'

const meta = {
  title: 'Pages/About/VersionInfo',
  component: VersionInfo,
  parameters: {
    docs: {
      description: {
        component: 'Displays version information for the application.',
      },
    },
  },
} satisfies Meta<typeof VersionInfo>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
