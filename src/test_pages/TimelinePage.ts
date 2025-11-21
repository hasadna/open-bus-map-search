import type { Page } from '@playwright/test'
import { test as base, expect as baseExpect } from 'tests/utils'
import { BasePage } from './BasePage'

export const expect = baseExpect.extend({
  toHaveDuplications(received: string[]) {
    const dups = received.toSorted().filter((item, index, arr) => item === arr[index - 1])
    const uniqueDups = [...new Set(dups)]
    const pass = (uniqueDups.length === 0) === this.isNot
    const expectation = this.isNot ? 'Expected no duplications' : 'Expected duplications'
    const reality = this.isNot
      ? `but found duplications: ${uniqueDups.join(', ')}`
      : 'but none were found.'
    const message = () => `${expectation}, ${pass ? 'and' : 'but'} ${reality}`
    return { pass, message, expected: [], actual: uniqueDups }
  },
})

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
    const uniqueOptions = selectOption.filter((item, index) => selectOption.indexOf(item) === index)
    expect(selectOption).toEqual(uniqueOptions)
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
