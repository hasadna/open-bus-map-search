export default {
  storybookConfigDir: '.storybook',
  async waitBeforeCapture() {
    const timeout = 180_000
    const pollInterval = 100
    const start = Date.now()

    while (document.querySelector('.ant-skeleton-content')) {
      if (Date.now() - start > timeout) {
        throw new Error('Timeout waiting for skeleton to disappear')
      }
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    }
  },
}
