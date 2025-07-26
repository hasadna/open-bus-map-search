module.exports = {
  testConcurrency: 20,

  waitBeforeCapture: async () => {
    const startTime = Date.now()
    const timeout = 15 * 1000
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
    await new Promise((resolve) => setTimeout(resolve, 2000)) // wait for end animations
    return true
  },
  // puppeteerOptions: {headless: false, devtools: true},
  showBrowserLogs: true,
  // showLogs: true,// uncomment to see Applitools logs
}
