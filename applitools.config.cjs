/**
 * @type {import('@applitools/eyes-playwright').Configuration}
 */
module.exports = {
  waitBeforeCapture: async (page) => {
    try {
      await page.waitForSelector('.ant-skeleton', { state: 'hidden', timeout: 180000 })
      await page.waitForTimeout(500)
    } catch (error) {
      console.warn('Error waiting for skeletons to disappear:', error.message)
    }
    return true
  },
  // puppeteerOptions: {headless: false, devtools: true},
  showBrowserLogs: true,
}
