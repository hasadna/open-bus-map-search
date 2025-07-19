module.exports = {
  testConcurrency: 20,

  waitBeforeCapture: async () => {
    const startTime = Date.now()
    const timeout = 3 * 60 * 1000
    while (
      document.querySelector('.ant-skeleton-content') ||
      document.querySelector('.ant-skeleton')
    ) {
      const duration = Date.now() - startTime
      await new Promise((resolve) => setTimeout(resolve, 100))
      if (duration > timeout) {
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
