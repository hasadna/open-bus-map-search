import { execSync } from 'child_process'
import { EyesFixture } from '@applitools/eyes-playwright/fixture'
import { defineConfig, devices } from '@playwright/test'

const gitUser = () => {
  try {
    return execSync('git config user.name', { encoding: 'utf-8' }).trim()
  } catch {
    return 'unknown'
  }
}

/* When PLAYWRIGHT_BASE_URL is set (CI runs the suite against the prebuilt nginx
   production image on an isolated, no-egress Docker network), point the browser
   at that server and don't start our own. Unset locally and in the offline
   coverage run → falls back to the Vite dev server on :3000, exactly as before. */
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<EyesFixture>({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry twice on CI. */
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 3 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['list'], ['html']],
  timeout: 3 * 60 * 1000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: externalBaseURL ?? 'http://localhost:3000',
    locale: 'he-IL',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? 'on' : 'on-all-retries',

    timezoneId: 'Asia/Jerusalem',

    /* Block service workers so they don't intercept stride-api fetch() calls,
       bypassing page.route() handlers (which would break HAR-based mocking in CI). */
    serviceWorkers: 'block',

    eyesConfig: {
      type: 'ufg',
      isDisabled: !process.env.APPLITOOLS_API_KEY,
      failTestsOnDiff: false,
      batch: {
        name: process.env.APPLITOOLS_BATCH_NAME ?? `Visual Tests - ${gitUser()}`,
        id: process.env.APPLITOOLS_BATCH_ID,
      },
      browsersInfo: [
        { width: 1280, height: 720, name: 'chrome' },
        { chromeEmulationInfo: { deviceName: 'Galaxy S23' } },
      ],
    },
  },
  expect: {
    timeout: 5000,
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run our own dev server before the tests, unless an external server URL was
     provided (PLAYWRIGHT_BASE_URL) — then the app is already served elsewhere. */
  webServer: externalBaseURL
    ? undefined
    : {
        command: 'npm start',
        reuseExistingServer: true,
        timeout: 120 * 1000,
        port: 3000,
      },
})
