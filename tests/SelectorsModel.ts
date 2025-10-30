import type { Locator, Page } from '@playwright/test'

export default class Selectors {
  _operatorSelector: Locator
  _routeSelector: Locator
  _stopSelector: Locator
  _lineNumberSelector: Locator

  constructor(page: Page) {
    this._operatorSelector = page.locator('#operator-select')
    this._lineNumberSelector = page.getByPlaceholder('לדוגמה: 17א')
    this._routeSelector = page
      .locator('div')
      .filter({ hasText: /^בחירת מסלול נסיעה/ })
      .locator('#route-select')
    this._stopSelector = page.locator('#stop-select')
  }
  get operator() {
    return this._operatorSelector
  }
  get lineNumber() {
    return this._lineNumberSelector
  }
  get route() {
    return this._routeSelector
  }
  get stop() {
    return this._stopSelector
  }
}
