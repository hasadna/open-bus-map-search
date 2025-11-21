import type { Locator, Page } from '@playwright/test'
import { test as base, expect as baseExpect } from 'tests/utils'
import { BasePage } from './BasePage'

class TimelinePage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  public async selectOperatorFromDropbox(locator: Locator, list: Locator, operatorName: string) {
    await this.selectFrom_UL_LI_Dropbox(locator, list, operatorName)
  }

  public async fillLineNumber(lineNumber: string) {
    await this.lineNumberField.fill(lineNumber)
  }
  public async verifyNoDuplications() {
    const list = new Set()
    const selectOption = await this.getAllOptions_Dropbox()
    for (const row of selectOption) list.add(await row.textContent())
    baseExpect(list.size).toBe(selectOption.length)
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

export const expect = baseExpect
