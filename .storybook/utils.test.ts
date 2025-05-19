import { waitFor } from '@storybook/test'

const isTestEnvironment = (): boolean => {
  if (typeof navigator !== 'undefined' && navigator.webdriver) return true
  if (typeof window !== 'undefined' && (window as any).Cypress) return true
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') return true
  return false
}

export async function waitForContent(
  canvasElement: HTMLElement,
  timeout: number = 3 * 60 * 1000,
): Promise<void> {
  if (!isTestEnvironment()) return
  await waitFor(
    function waitForSkeletonToHide() {
      const skeleton = canvasElement.querySelector('.ant-skeleton-content')
      if (skeleton) {
        throw new Error('Skeleton still visible after timeout')
      }
    },
    { timeout },
  )
}

export const getPastDate = (week?: boolean) => {
  return new Date(week ? '2024-02-5 15:00:00' : '2024-02-12 15:00:00')
}
