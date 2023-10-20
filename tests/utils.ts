import { test as base } from 'playwright-advanced-har'

export const test = base.extend({
  page: async ({ page }, use) => {
    await use(page)
  },
})
