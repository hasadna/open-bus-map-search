import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  staticDirs: ['../public'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: false,
    check: true,
  },
  viteFinal: async (config) => {
    // Set base URL from environment variable for preview deployments
    config.base = process.env.VITE_PREVIEW_URL
      ? `${process.env.VITE_PREVIEW_URL}storybook/`
      : '/storybook/'
    return config
  },
}

export const getPastDate = () => {
  return new Date('2024-02-12 15:00:00')
}

export default config
