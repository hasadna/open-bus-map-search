import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { VersionInfo } from './VersionInfo'

export default {
  title: 'About/VersionInfo',
  component: VersionInfo,
}

const queryClient = new QueryClient()
queryClient.setQueryData(['version'], '1.2.3')

export const Default = () => (
  <QueryClientProvider client={queryClient}>
    <VersionInfo />
  </QueryClientProvider>
)
