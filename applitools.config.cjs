/**
 * @type {import('@applitools/eyes-playwright').Configuration}
 */
module.exports = {
  waitBeforeCapture: async () => {
    while (
      document.querySelector('.ant-skeleton-content') ||
      document.querySelector('.ant-skeleton')
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return true
  },
  // puppeteerOptions: {headless: false, devtools: true},
  showBrowserLogs: true,
}
