// @ts-check

/**
 * @type {import('@applitools/eyes-storybook').ApplitoolsConfig}
 */
const config = {
  // Pin the Applitools app explicitly: unset, eyes-storybook falls back to the
  // package.json name, putting the story baselines in a different app than the
  // Playwright ones.
  appName: 'OpenBus',
  testConcurrency: 20,
  dontCloseBatches: true,
  // 'nodiffs': visual diffs don't fail the job (the github integration reports them via a separate
  // commit status), but real errors (stories failed to load/render) still exit non-zero.
  // The value is undocumented (typed as boolean) but supported — see eyes-storybook src/processResults.js.
  exitcode: /** @type {boolean} */ (/** @type {unknown} */ ('nodiffs')),
  // A story that is meant to stay in its loading state opts out with
  // `parameters: { eyes: { waitBeforeCapture: <ms> } }`, which takes precedence over this.
  waitBeforeCapture: async () => {
    const startTime = Date.now()
    const timeout = 60 * 1000
    while (
      document.querySelector(
        '.ant-skeleton, .ant-skeleton-content, [data-testid="skeleton-loader"]',
      )
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
  showBrowserLogs: true,
  // showLogs: true,// uncomment to see Applitools logs
}

module.exports = config
