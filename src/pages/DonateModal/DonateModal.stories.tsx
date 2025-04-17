import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import DonateModal from './DonateModal'

const meta: Meta<typeof DonateModal> = {
  component: DonateModal,
  title: 'Pages/DonateModal',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClose: {
      action: 'close',
    },
    isVisible: {
      control: 'boolean',
      description: 'Whether the modal is visible.',
    },
  },
  decorators: [
    (Story, meta) => {
      const [isVisible, setIsVisible] = useState(meta.args.isVisible)
      const { t } = useTranslation()

      return (
        <>
          <button onClick={() => setIsVisible(true)}>{t('donate_title')}</button>
          <Story
            args={{
              isVisible,
              onClose: () => setIsVisible(false),
            }}
          />
        </>
      )
    },
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isVisible: true,
  },
}
