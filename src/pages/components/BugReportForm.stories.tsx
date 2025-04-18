import type { Meta, StoryObj } from '@storybook/react'
import BugReportForm from '../BugReportForm '

const meta: Meta<typeof BugReportForm> = {
  title: 'Components/BugReportForm',
  component: BugReportForm,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
