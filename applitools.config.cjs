/**
 * @type {import('@applitools/eyes-storybook').Configuration}
 */
module.exports = {
  waitBeforeCapture: async () => {
    const startTime = Date.now()
    return new Promise((resolve, reject) => {
      const check = () => {
        if (!document.querySelector('.ant-skeleton')) {
          resolve(true)
        } else if (Date.now() - startTime > 25000) {
          reject(new Error('Timeout waiting for skeletons to disappear'))
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  },
  // puppeteerOptions: {headless: false, devtools: true},
  showBrowserLogs: true,
}
