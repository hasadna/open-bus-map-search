import type { Preview } from '@storybook/react'
import React from 'react'
import i18n from 'src/locale/allTranslations'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      i18n
      return (
        <div style={{ direction: 'rtl' }}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
