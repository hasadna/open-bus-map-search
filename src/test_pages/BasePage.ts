import { expect, Locator, Page, test } from '@playwright/test'

export abstract class BasePage {
  constructor(protected page: Page) {}

  protected async verifySelectionVisible(locator: Locator, isVisible: boolean) {
    if (isVisible) {
      await expect(locator).toBeVisible()
    } else {
      await expect(locator).toBeHidden()
    }
  }

  protected async selectFrom_UL_LI_Dropbox(
    dropElement: Locator,
    optionsListElement: Locator,
    optionToSelect: string,
  ) {
    await test.step(`Click on UL LI dropbox element and select '${optionToSelect}'`, async () => {
      await dropElement.click()
      await optionsListElement.locator(`//li[text()='${optionToSelect}']`).click()
    })
  }

  protected async getAllOptions_Dropbox() {
    let options: Locator[] = []
    await test.step(`select all Options from dropBox`, async () => {
      options = await this.page.getByRole('option').all()
    })
    return options
  }
}
