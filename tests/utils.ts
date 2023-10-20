import { test as base } from '@playwright/test'

export const test = base.extend({
  page: async ({ page }, use) => {
    await use(page)
  },
})
