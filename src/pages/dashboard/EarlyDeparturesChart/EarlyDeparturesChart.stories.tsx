import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { useState } from 'react'
import { civilDate } from 'src/model/time/civilDate'
import EarlyDeparturesChart from './EarlyDeparturesChart'

const INDEX_URL = 'https://kavbochan.app/bus/data/index.json'

const INDEX = {
  updated: '2026-11-27T05:14Z',
  days: [
    { d: '2026-11-20', o: [144, 33266, 1356, 487, 136] },
    { d: '2026-11-21', o: [96, 15072, 657, 304, 128] },
    { d: '2026-11-22', o: [351, 67238, 3117, 1274, 463] },
    { d: '2026-11-23', o: [312, 65097, 3461, 1694, 577] },
    { d: '2026-11-24', o: [313, 68081, 3142, 1291, 421] },
    { d: '2026-11-25', o: [386, 68834, 3031, 1205, 329] },
    { d: '2026-11-26', o: [279, 70573, 3260, 1233, 333] },
  ],
}

/** Every story gets its own cache: the shared one would answer the failing story with the
 *  index an earlier story already loaded. */
const FreshQueryClient = ({ children }: { children: React.ReactNode }) => {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const meta = {
  component: EarlyDeparturesChart,
  title: 'Pages/Dashboard/EarlyDeparturesChart',
  decorators: [
    (Story) => (
      <FreshQueryClient>
        <Story />
      </FreshQueryClient>
    ),
  ],
  argTypes: {
    startDate: { control: 'text', description: 'First day of the range, YYYY-MM-DD.' },
    endDate: { control: 'text', description: 'Last day of the range, YYYY-MM-DD.' },
  },
  args: {
    startDate: civilDate('2026-11-20')!,
    endDate: civilDate('2026-11-26')!,
  },
  parameters: {
    msw: { handlers: [http.get(INDEX_URL, () => HttpResponse.json(INDEX))] },
  },
} satisfies Meta<typeof EarlyDeparturesChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const PartlyPublished: Story = {
  args: { startDate: civilDate('2026-11-24')!, endDate: civilDate('2026-11-30')! },
}

export const NothingInRange: Story = {
  args: { startDate: civilDate('2026-10-01')!, endDate: civilDate('2026-10-07')! },
}

export const SourceUnreachable: Story = {
  parameters: {
    msw: { handlers: [http.get(INDEX_URL, () => new HttpResponse(null, { status: 503 }))] },
  },
}
