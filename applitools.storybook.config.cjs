/**
 * @type {import('@applitools/eyes-storybook').Configuration}
 */
module.exports = {
  waitBeforeCapture: async (page) => {
    try {
      await page.waitForSelector('.ant-skeleton', { state: 'hidden', timeout: 25000 })
    } catch (error) {
      console.warn('Error waiting for skeletons to disappear:', error.message)
    }
  },
  showBrowserLogs: true,
}
