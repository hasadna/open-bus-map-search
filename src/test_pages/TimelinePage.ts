import type { Page } from '@playwright/test'
import { test as base, expect } from 'tests/utils'
import { BasePage } from './BasePage'

class TimelinePage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  public async selectOperator(operatorName: string) {
    await this.selectFromDropdown(this.operatorsDropDown, this.operatorsList, operatorName)
  }
  public async selectStation(operatorName: string) {
    await this.selectFromDropdown(this.stationSelect, this.stationList, operatorName)
  }
  public async selectRoute(operatorName: string) {
    await this.selectFromDropdown(this.routeSelect, this.routeList, operatorName)
  }

  public async fillLineNumber(lineNumber: string) {
    await this.lineNumberField.fill(lineNumber)
  }
  public async verifyNoDuplications() {
    const selectOption = await this.getDropdownOptions()
    expect(selectOption).not.toHaveDuplications()
  }

  public get routeSelect() {
    return this.page.locator('#route-select')
  }
  public get stationSelect() {
    return this.page.locator('#stop-select')
  }
  public get operatorsDropDown() {
    return this.page.locator("button[aria-label='פתח']")
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
  get closeButton() {
    return this.page.locator("span[aria-label='close']")
  }

  get lineNumberField() {
    return this.page.locator("//input[@placeholder='לדוגמה: 17א']")
  }
}

export const test = base.extend<{ timelinePage: TimelinePage }>({
  timelinePage: async ({ page }, use) => {
    await use(new TimelinePage(page))
  },
})
