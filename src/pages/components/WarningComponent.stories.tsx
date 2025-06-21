import { Warning } from '@mui/icons-material'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useTranslation } from 'react-i18next'
import { WarningComponent } from './WarningComponent'


const meta = {
  title: 'Components/WarningComponent',
  component: WarningComponent,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    children: {
      description: 'The text content of the warning component.',
      control: { type: 'text' },
      table: { type: { summary: 'React.ReactNode' } },
    },
  },
} satisfies Meta<typeof WarningComponent>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    (Story, meta) => {
      const { t } = useTranslation()
      const children = meta.args.children || t('line_not_found')
      return <Story args={{ children, text: 'ארעה תקלה זמנית במערכת, אנא נסה שנית במועד מאוחר יותר' }} />
    },
  ],
}
