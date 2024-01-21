import { Locator, Page, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export default class TimelinePage extends BasePage {
  private date: Locator
  private operator: Locator
  public operators_dropdown: Locator
  private operators_list: Locator
  private line_number: Locator
  private close_line_number: Locator
  public route_select: Locator
  public station_select: Locator
  private eged_taavura: Locator
  private routes_list: Locator
  private stop_station_list: Locator
  private timeline_graph: Locator

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
    this.station_select = this.page.locator('#stop-select')
    this.routes_list = this.page.locator('ul#route-select-listbox')
    this.stop_station_list = this.page.locator('ul#stop-select-listbox')
    this.timeline_graph = this.page.locator('h4')
  }

  public async selectOperatorFromDropbox(operatorName: string) {
    await this.selectFrom_UL_LI_Dropbox(this.operators_dropdown, this.operators_list, operatorName)
  }

  public async fillLineNumber(lineNumber: string) {
    await this.fillTextToElement(this.line_number, lineNumber)
  }

  public async closeLineNumber() {
    await this.clickOnElement(this.close_line_number, 3000)
  }

  public async verifyRouteSelectionVisible(isVisible: boolean) {
    isVisible
      ? await expect(this.route_select).toBeVisible({ timeout: 3000 })
      : await expect(this.route_select).toBeHidden({ timeout: 2000 })
  }

  public async verifyDuplications(selectBox: Locator) {
    const list = new Set()
    const selectOption = await this.getAllOptions_Dropbox(selectBox)
    for (const row of selectOption) list.add(await row.textContent())
    expect(list.size === selectOption.length).toBe(true)
  }

  public async verifyLineNumberNotFound() {
    await expect(this.page.getByText('הקו לא נמצא')).toBeVisible()
  }

  public async selectRouteSelection(routeName: string) {
    await this.selectFrom_UL_LI_Dropbox(this.route_select, this.routes_list, routeName)
  }

  public async verifyStationSelectionVisible() {
    await expect(this.station_select).toBeVisible({ timeout: 2000 })
  }

  public async selectStopStationSelection(stationName: string) {
    await this.selectFrom_UL_LI_Dropbox(this.station_select, this.stop_station_list, stationName)
  }

  public async verifyTimestampGraphSelectionVisible() {
    await expect(this.timeline_graph).toBeVisible({ timeout: 30000 })
  }
}
