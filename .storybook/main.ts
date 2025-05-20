import type { StorybookConfig } from '@storybook/react-vite'
import { waitFor } from '@storybook/test'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: true,
  },
  typescript: {
    reactDocgen: false,
    check: true,
  },
}

export const getPastDate = (week?: boolean) => {
  return new Date(week ? '2024-02-5 15:00:00' : '2024-02-12 15:00:00')
}

export async function waitForContent(canvasElement: HTMLElement) {
  if (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (typeof window !== 'undefined' && (window as any).Cypress) ||
    (typeof navigator !== 'undefined' && navigator.webdriver) ||
    (typeof process !== 'undefined' && process.env.NODE_ENV === 'test')
  ) {
    return
  }
  return await waitFor(
    () => {
      if (canvasElement.querySelector('.ant-skeleton-content')) {
        throw new Error('Skeleton still visible after timeout')
      }
    },
    { timeout: 180_000, interval: 100 },
  )
}

export default config
