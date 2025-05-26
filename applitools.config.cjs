/**
 * @type {import('@applitools/eyes-playwright').Configuration}
 */
module.exports = {
  waitBeforeCapture: async () => {
    const startTime = Date.now()
    while (
      document.querySelector('.ant-skeleton-content') ||
      document.querySelector('.ant-skeleton') ||
      document.querySelector('.MuiCircularProgress-svg')
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      if (Date.now() - startTime > 10000) {
        console.warn('Waited too long for skeletons to disappear, proceeding anyway.')
        break
      }
    }
  },
  // puppeteerOptions: {headless: false, devtools: true},
  showBrowserLogs: true,
}
