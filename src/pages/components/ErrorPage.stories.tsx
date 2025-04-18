import type { Meta, StoryObj } from '@storybook/react'

import { ErrorPage } from '../ErrorPage'

const meta: Meta<typeof ErrorPage> = {
  title: 'Pages/ErrorPage',
  component: ErrorPage,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
