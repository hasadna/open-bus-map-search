module.exports = {
  testConcurrency: 10,
  waitBeforeCapture: async () => {
    const startTime = Date.now()
    const timeout = 20 * 1000
    const WaitForAniamtion =
      document.querySelector('.ant-skeleton-content') || document.querySelector('.ant-skeleton')
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
    if (WaitForAniamtion) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
    return true
  },
  // puppeteerOptions: {headless: false, devtools: true},
  showBrowserLogs: true,
  // showLogs: true,// uncomment to see Applitools logs
}
