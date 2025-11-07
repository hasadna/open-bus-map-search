import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry twice on CI. */
  retries: process.env.CI ? 2 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['./tests/testReport.ts'], ['html']],
  timeout: 5 * 60 * 1000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? 'on' : 'on-all-retries',

    timezoneId: 'Asia/Jerusalem',
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

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm start',
    reuseExistingServer: true,
    timeout: 120 * 1000,
    port: 3000,
  },
})
