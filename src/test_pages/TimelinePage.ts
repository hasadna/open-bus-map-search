import { Locator, Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export default class TimelinePage extends BasePage {
  private date: Locator
  private operator: Locator
  private operators_dropdown: Locator
  private operators_list: Locator
  private line_number: Locator
  private close_line_number: Locator
  private route_select: Locator
  private station_select: Locator
  private eged_taavura: Locator

  constructor(protected page: Page) {
    super(page)
    this.date = this.page.locator("//input[@placeholder='DD/MM/YYYY']")
    this.operator = this.page.locator('#operator-select')
    this.line_number = this.page.locator("//input[@placeholder='לדוגמא: 17א']")
    this.close_line_number = this.page.locator("span[aria-label='close']")
    this.route_select = this.page.locator('#route-select')
    this.operators_dropdown = this.page.locator("button[aria-label='Open']")
    this.operators_list = this.page.locator('ul#operator-select-listbox')
    this.eged_taavura = this.page.locator("//li[text()='אגד תעבורה']")
    this.station_select = this.page.locator('')
  }

  public async selectOperatorFromDropbox(operatorName: string) {
    await this.selectFrom_UL_LI_Dropbox(this.operators_dropdown, this.operators_list, operatorName)
  }

  public async fillLineNumber(lineNumber: string) {
    await this.fillTextToElement(this.line_number, lineNumber)
  }

  public async closeLineNumber() {
    await this.clickOnElement(this.close_line_number)
  }

  public async verifyRouteSelectionVisible(isVisible: boolean) {
    isVisible
      ? await expect(this.route_select).toBeVisible({ timeout: 2000 })
      : await expect(this.route_select).toBeHidden({ timeout: 2000 })
  }
}
