import { Stack } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useTranslation } from 'react-i18next'
import { PageHeaderVideoTrigger } from './pageHeader'

const VIDEO_URL =
  'https://www.youtube-nocookie.com/embed?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=11'

const meta = {
  title: 'Components/VideoTrigger',
  component: PageHeaderVideoTrigger,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PageHeaderVideoTrigger>

export default meta

type Story = StoryObj<typeof meta>

const VideoTriggerVariants = () => {
  const { t } = useTranslation()

  return (
    <Stack direction="row" spacing={2}>
      <PageHeaderVideoTrigger
        title={t('youtube_modal_info_title')}
        videoUrl={VIDEO_URL}
        variant="ghost">
        {t('youtube_modal_info_title')}
      </PageHeaderVideoTrigger>
      <PageHeaderVideoTrigger
        title={t('youtube_modal_info_title')}
        videoUrl={VIDEO_URL}
        variant="outlined">
        {t('youtube_modal_info_title')}
      </PageHeaderVideoTrigger>
      <PageHeaderVideoTrigger
        title={t('youtube_modal_info_title')}
        videoUrl={VIDEO_URL}
        variant="contained">
        {t('youtube_modal_info_title')}
      </PageHeaderVideoTrigger>
    </Stack>
  )
}

export const Variants: Story = {
  args: {
    children: null,
    title: '',
    videoUrl: VIDEO_URL,
  },
  render: () => <VideoTriggerVariants />,
}
