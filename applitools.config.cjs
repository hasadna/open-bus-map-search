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
  // Three waits, in order: the story is on the page, its data has loaded, and it has
  // stopped moving. Skipping the last one is what put a half-drawn line chart in a
  // baseline — the skeleton clears when the data lands, ~1.5s before recharts finishes
  // drawing, so "no skeleton" is not the same as "done rendering".
  waitBeforeCapture: async () => {
    const MOUNT_TIMEOUT = 10 * 1000
    const SKELETON_TIMEOUT = 60 * 1000
    const SETTLE_TIMEOUT = 10 * 1000
    // Long enough to bridge a frame at 60fps with room to spare, short enough that it
    // costs nothing on a story that was already still.
    const QUIET_MS = 250

    const sleep = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms))
    const root = () => document.querySelector('#storybook-root') || document.body

    // 1. The story has to actually be on the page. Run before React has committed
    //    anything and every check below passes trivially on an empty document.
    const mountDeadline = Date.now() + MOUNT_TIMEOUT
    while (root().childElementCount === 0 && Date.now() < mountDeadline) {
      await sleep(50)
    }

    // 2. Data still loading.
    const skeletonDeadline = Date.now() + SKELETON_TIMEOUT
    while (document.querySelector('[data-testid="skeleton-loader"]')) {
      if (Date.now() > skeletonDeadline) {
        console.warn('Waited too long for skeletons to disappear.')
        throw new Error('Skeletons did not disappear in time on ' + window.location.href)
      }
      await sleep(100)
    }

    // 3. Still animating. recharts draws a chart by rewriting SVG attributes from JS on
    //    every frame, which `document.getAnimations()` cannot see — a MutationObserver
    //    going quiet is the signal that it finished. Times out instead of throwing: a
    //    story that animates forever should still be captured, just not waited on.
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
      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
      })
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
