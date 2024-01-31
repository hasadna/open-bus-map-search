import { Locator, Page, expect, test } from '@playwright/test'

export abstract class BasePage {
  constructor(protected page: Page) {}

  async validatePageUrl(url: RegExp | string) {
    await test.step(`Validating that a correct value of URL is ${url}`, async () => {
      await expect(this.page).toHaveURL(url)
    })
  }

  protected async clickOnElement(element: Locator, timeout?: number) {
    // TODO: make sure that element.toString() doesn't make [object Object]
    await test.step(`Click on ${element.toString()}`, async () => {
      await element.click({ timeout: timeout || 0 })
    })
  }

  protected async fillTextToElement(element: Locator, textToFill: string) {
    await test.step(`Filling the '${textToFill}' into the ${element}`, async () => {
      await element.fill(textToFill)
    })
  }

  protected async clearTextFromElement(element: Locator) {
    await test.step(`Clearing '${element}' from text`, async () => {
      await element.clear()
    })
  }

  protected async verifySelectionVisible(locator: Locator, isVisible: boolean, timeout?: number) {
    isVisible
      ? await expect(locator).toBeVisible({ timeout: timeout || 5000 })
      : await expect(locator).toBeHidden({ timeout: timeout || 5000 })
  }

  protected async selectFrom_UL_LI_Dropbox(
    dropElement: Locator,
    optionsListElement: Locator,
    optionToSelect: string,
  ) {
    await test.step(`Click on UL LI dropbox '${dropElement}' element and select '${optionToSelect}' from ${optionsListElement}`, async () => {
      await this.clickOnElement(dropElement)
      await this.clickOnElement(optionsListElement.locator(`//li[text()='${optionToSelect}']`))
    })
  }
}
