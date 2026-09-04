import { Locator, Page, test } from '@playwright/test'

export abstract class BasePage {
  constructor(protected page: Page) {}

  async selectFromDropdown(
    dropElement: Locator,
    optionsListElement: Locator,
    optionToSelect: string,
  ) {
    await test.step(`Click on dropdown and select '${optionToSelect}'`, async () => {
      await dropElement.click()
      await optionsListElement.getByRole('option', { name: optionToSelect, exact: true }).click()
    })
  }

  async getDropdownOptions(scope: Locator | Page = this.page) {
    let options: string[] = []
    await test.step(`select all Options from dropBox`, async () => {
      options = await scope.getByRole('option').allInnerTexts()
    })
    return options
  }
}
