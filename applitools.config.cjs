// @ts-check

/**
 * @type {import('@applitools/eyes-storybook').ApplitoolsConfig}
 */
const config = {
  testConcurrency: 20,
  dontCloseBatches: true,
  // 'nodiffs': visual diffs don't fail the job (the github integration reports them via a separate
  // commit status), but real errors (stories failed to load/render) still exit non-zero.
  // The value is undocumented (typed as boolean) but supported — see eyes-storybook src/processResults.js.
  exitcode: /** @type {boolean} */ (/** @type {unknown} */ ('nodiffs')),
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
  puppeteerOptions: { args: ['--lang=he-IL', '--accept-lang=he-IL'] },
  // Logging off — it floods the run with MSW "unhandled request" warnings.
  // To debug:
  // SDK + browser logs → uncomment both flags below;
  // browser only → uncomment env APPLITOOLS_DEBUG_BROWSER_LOGS=true (validate.yaml);
  // showLogs: true, // Applitools SDK logs
  // showBrowserLogs: true, // browser console (requires showLogs)
}

module.exports = config
