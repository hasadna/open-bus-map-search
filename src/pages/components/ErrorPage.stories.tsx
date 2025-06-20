import type { Meta, StoryObj } from '@storybook/react-vite'

import { ErrorPage } from '../ErrorPage'

const meta = {
  title: 'Pages/ErrorPage',
  component: ErrorPage,
} satisfies Meta<typeof ErrorPage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
