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
  //
  // "No skeleton" is not the same as "done rendering": the skeleton clears when the data
  // lands, ~1.5s before recharts has finished drawing the chart it hands off to. That gap
  // is what put a half-drawn line chart in a baseline, so wait for the charts too.
  waitBeforeCapture: async () => {
    const startTime = Date.now()
    const timeout = 60 * 1000
    while (document.querySelector('[data-testid="skeleton-loader"]')) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      const duration = Date.now() - startTime
      const isTimeout = duration > timeout
      if (isTimeout) {
        console.warn('Waited too long for skeletons to disappear.')
        throw new Error('Skeletons did not disappear in time on ' + window.location.href)
      }
    }

    // recharts animates by rewriting SVG attributes from JS on every frame, which
    // `document.getAnimations()` cannot see — a MutationObserver going quiet is the
    // signal that it finished. Scoped to the chart subtrees, and skipped entirely when
    // the story has no chart, so the ~85% of stories that hold none pay nothing. (Waiting
    // for the whole document to go quiet instead is ~1.4s on every story, which doubled
    // the visual-test job for one story's benefit.) Times out rather than throwing: a
    // chart that animates forever should still be captured, just not waited on.
    const SETTLE_TIMEOUT = 10 * 1000
    // Long enough to bridge a frame at 60fps with room to spare, short enough that it
    // costs nothing on a chart that was already still.
    const QUIET_MS = 250
    // ResponsiveContainer renders its div on mount, before the chart inside it exists, so
    // this matches a chart story even while the chart is still being laid out.
    const charts = document.querySelectorAll('.recharts-responsive-container, .recharts-wrapper')
    if (charts.length === 0) return true

    await new Promise((resolve) => {
      /** @type {ReturnType<typeof setTimeout>} */ let quietTimer
      /** @type {ReturnType<typeof setTimeout>} */ let hardTimer
      function finish() {
        observer.disconnect()
        clearTimeout(quietTimer)
        clearTimeout(hardTimer)
        resolve(undefined)
      }
      const observer = new MutationObserver(() => {
        clearTimeout(quietTimer)
        quietTimer = setTimeout(finish, QUIET_MS)
      })
      charts.forEach((chart) =>
        observer.observe(chart, {
          subtree: true,
          childList: true,
          attributes: true,
          characterData: true,
        }),
      )
      quietTimer = setTimeout(finish, QUIET_MS)
      hardTimer = setTimeout(finish, SETTLE_TIMEOUT)
    })

    return true
  },
  // puppeteerOptions: {headless: false, devtools: true},
  puppeteerOptions: { args: ['--lang=he-IL', '--accept-lang=he-IL'] },
  showBrowserLogs: true,
  // showLogs: true,// uncomment to see Applitools logs
}

module.exports = config
