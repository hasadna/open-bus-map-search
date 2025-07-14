module.exports = {
  testConcurrency: 20,

  waitBeforeCapture: async () => {
    const startTime = Date.now()
    while (
      document.querySelector('.ant-skeleton-content') ||
      document.querySelector('.ant-skeleton')
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      if (Date.now() - startTime > 50000) {
        // debugger
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
