import type { Meta, StoryObj } from '@storybook/react'
import { useTranslation } from 'react-i18next'
import InfoYoutubeModal from './YoutubeModal'

const meta = {
  title: 'Components/InfoYoutubeModal',
  component: InfoYoutubeModal,
  parameters: {
    layout: 'centered',
  },
  args: { label: '', title: '', videoUrl: '' },
  argTypes: {
    label: {
      description: 'The label of the button',
      type: 'string',
    },
    title: {
      description: 'The title of the modal',
      type: 'string',
    },
    videoUrl: {
      description: 'The URL of the video',
      type: 'string',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof InfoYoutubeModal>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    (Story) => {
      const { t } = useTranslation()

      return (
        <Story
          args={{
            label: t('open_video_about_this_page'),
            title: t('youtube_modal_info_title'),
            videoUrl:
              'https://www.youtube-nocookie.com/embed?v=F6sD9Bz4Xj0&list=PL6Rh06rT7uiX1AQE-lm55hy-seL3idx3T&index=11',
          }}
        />
      )
    },
  ],
}
