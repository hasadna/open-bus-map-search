import type { Meta, StoryObj } from '@storybook/react'
import BugReportForm from '../BugReportForm '

const meta = {
  title: 'Components/BugReportForm',
  component: BugReportForm,
} satisfies Meta<typeof BugReportForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
