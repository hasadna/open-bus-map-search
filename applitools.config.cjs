// @ts-check

/**
 * @type {import('@applitools/eyes-storybook').ApplitoolsConfig}
 */
const config = {
  testConcurrency: 20,
  dontCloseBatches: true,
  waitBeforeCapture: async () => {
    const startTime = Date.now()
    const timeout = 60 * 1000
    while (
      document.querySelector('.ant-skeleton-content') ||
      document.querySelector('.ant-skeleton')
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      const duration = Date.now() - startTime
      const isTimeout = duration > timeout
      if (isTimeout) {
        console.warn('Waited too long for skeletons to disappear.')
        throw new Error('Skeletons did not disappear in time on ' + window.location.href)
      }
    }
    return true
  },
  // puppeteerOptions: {headless: false, devtools: true},
  showBrowserLogs: true,
  // showLogs: true,// uncomment to see Applitools logs
}

module.exports = config
