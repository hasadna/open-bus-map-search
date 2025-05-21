import type { Meta, StoryObj } from '@storybook/react'
import { useTranslation } from 'react-i18next'
import { NotFound } from './NotFound'

const meta = {
  title: 'Components/NotFound',
  component: NotFound,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {
      description: 'The text content of the not found component.',
      control: { type: 'text' },
      table: { type: { summary: 'React.ReactNode' } },
    },
  },
} satisfies Meta<typeof NotFound>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    (Story, meta) => {
      const { t } = useTranslation()
      const children = meta.args.children || t('line_not_found')
      return <Story args={{ children }} />
    },
  ],
}
