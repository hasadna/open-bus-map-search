import { Locator, Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export default class TimelinePage extends BasePage {
  private date: Locator
  private operator: Locator
  private line_number: Locator
  private close_line_number: Locator
  private eged_taavura: Locator

  constructor(protected page: Page) {
    super(page)
    this.date = this.page.locator("//input[@placeholder='DD/MM/YYYY']")
    this.operator = this.page.locator('#operator-select')
    this.line_number = this.page.locator("//input[@placeholder='לדוגמא: 17א']")
    this.close_line_number = this.page.locator("span[aria-label='close']")
    this.eged_taavura = this.page.locator("//li[text()='אגד תעבורה']")
  }

  public async selectOperatorFromDropbox(locator: Locator, list: Locator, operatorName: string) {
    await this.selectFrom_UL_LI_Dropbox(locator, list, operatorName)
  }

  public async fillLineNumber(lineNumber: string) {
    await this.fillTextToElement(this.line_number, lineNumber)
  }

  public async closeLineNumber() {
    await this.clickOnElement(this.close_line_number, 3000)
  }

  public async openSelectBox(selectBox: Locator, timeout?: number) {
    await this.clickOnElement(selectBox, timeout || 3000)
  }

  public async verifyRouteSelectionVisible(locator: Locator, isVisible: boolean, timeout?: number) {
    await this.verifySelectionVisible(locator, isVisible, timeout)
  }

  public async verifyNoDuplications() {
    const list = new Set()
    const selectOption = await this.getAllOptions_Dropbox()
    for (const row of selectOption) list.add(await row.textContent())
    expect(list.size).toBe(selectOption.length)
  }

  public async verifyLineNumberNotFound() {
    await expect(this.page.getByText('הקו לא נמצא')).toBeVisible()
  }

  public get routeSelect() {
    return this.page.locator('#route-select')
  }
  public get stationSelect() {
    return this.page.locator('#stop-select')
  }
  public get operatorsDropDown() {
    return this.page.locator("button[aria-label='Open']")
  }

  public get timelineGraph() {
    return this.page.locator('h4')
  }

  public get operatorsList() {
    return this.page.locator('ul#operator-select-listbox')
  }

  public get routeList() {
    return this.page.locator('ul#route-select-listbox')
  }

  public get stationList() {
    return this.page.locator('ul#stop-select-listbox')
  }
}
