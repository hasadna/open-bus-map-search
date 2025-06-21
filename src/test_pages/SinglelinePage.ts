import { Locator, Page, test } from '@playwright/test'
import { BasePage } from './BasePage'

export default class SinglinePage extends BasePage {
  private date: Locator
  private operator: Locator
  private operators_dropdown: Locator
  private operators_list: Locator
  private line_number: Locator
  private close_line_number: Locator
  private route_select: Locator
  private hours_list: Locator
  private hours_dropdown: Locator

  constructor(protected page: Page) {
    super(page)
    this.date = this.page.locator('label').filter({ hasText: 'תאריך' })
    this.operator = this.page.locator('#operator-select')
    this.line_number = this.page.locator('label').filter({ hasText: 'מספר קו' })
    this.close_line_number = this.page.locator("span[aria-label='close']")
    this.route_select = this.page.locator('#route-select')
    this.operators_dropdown = this.page.locator('#operator-select')
    this.operators_list = this.page.locator('ul#operator-select-listbox')
    this.hours_dropdown = this.page.getByLabel('Open').nth(2)
    this.hours_list = this.page.locator('ul#start-time-select-listbox')
  }

  public async selectOperatorFromDropbox(operatorName: string) {
    await this.selectFrom_UL_LI_Dropbox(this.operators_dropdown, this.operators_list, operatorName)
  }

  public async verifyOperatorExistsInDropbox(operatorName: string) {
    await test.step(`Verifying ${operatorName} is in dropbox`, async () => {
      await this.page.locator('ul#operator-select li').filter({ hasText: operatorName }).isVisible()
    })
  }

  public async openOperatorSelection() {
    await this.clickOnElement(this.operators_dropdown)
  }

  public async openHoursSelection() {
    await this.clickOnElement(this.hours_dropdown, 5000)
  }

  public async fillLineNumber(lineNumber: string) {
    await this.fillTextToElement(this.line_number, lineNumber)
  }

  public async closeLineNumber() {
    await this.clickOnElement(this.close_line_number)
  }

  public async verifyRouteSelectionEnable(isEnable = true) {
    await this.verifySelectionEnable(this.route_select, isEnable)
  }

  public async selectRandomRoute() {
    await this.clickOnElement(this.route_select)
    const options = this.page.locator('ul#route-select-listbox li')
    const optionsCount = await options.count()
    const randomIndex = Math.floor(Math.random() * optionsCount)

    await test.step(`Selecting route ${randomIndex} out of ${optionsCount}`, async () => {
      await options.nth(randomIndex).scrollIntoViewIfNeeded()
      await options.nth(randomIndex).click()
    })
  }

  public async changeDate(newDate: string) {
    await test.step(`Changing date to: ${newDate}`, async () => {
      await this.clearTextFromElement(this.date)
      await this.fillTextToElement(this.date, newDate)
    })
  }
}
