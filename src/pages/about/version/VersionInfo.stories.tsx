import type { Meta, StoryObj } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VersionInfo } from './VersionInfo'

const queryClient = new QueryClient()
queryClient.setQueryData(['version'], '1.2.3')

const meta: Meta<typeof VersionInfo & { QueryClientProvider: QueryClient }> = {
  title: 'Pages/About/VersionInfo',
  component: VersionInfo,
  tags: ['autodocs'],
  argTypes: {
    QueryClientProvider: {
      control: false,
    },
  },
  decorators: [
    (Story) => {
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      )
    },
  ],
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
