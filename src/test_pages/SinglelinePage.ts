import { Locator, Page } from '@playwright/test'
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
    this.date = this.page.getByPlaceholder('DD/MM/YYYY')
    this.operator = this.page.locator('#operator-select')
    this.line_number = this.page.locator("//input[@placeholder='לדוגמא: 17א']")
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

  public async openHoursSelection() {
    await this.hours_dropdown.click({ timeout: 5000 })
  }

  public async fillLineNumber(lineNumber: string) {
    await this.fillTextToElement(this.line_number, lineNumber)
  }

  public async closeLineNumber() {
    await this.clickOnElement(this.close_line_number)
  }

  public async verifyRouteSelectionVisible(isVisible: boolean) {
    await this.verifySelectionVisible(this.route_select, isVisible)
  }

  public async selectRandomRoute() {
    await this.route_select.click()
    const options = this.page.locator('ul#route-select-listbox li')
    console.log('options', await options.count())

    const randomIndex = Math.floor(Math.random() * (await options.count()))
    console.log('chose', randomIndex)
    await options.nth(randomIndex).scrollIntoViewIfNeeded()
    await options.nth(randomIndex).click()
  }

  public async changeDate(newDate: string) {
    console.log('Changing date to:', newDate)
    await this.page.waitForTimeout(2000)
    await this.date.clear()
    await this.date.fill(newDate)
  }
}
