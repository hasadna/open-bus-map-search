import type { Meta, StoryObj } from '@storybook/react'
import BugReportForm from '../BugReportForm '
import { waitForContent } from '../../../.storybook/main'

const meta = {
  title: 'Components/BugReportForm',
  component: BugReportForm,
  play: waitForContent,
} satisfies Meta<typeof BugReportForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
