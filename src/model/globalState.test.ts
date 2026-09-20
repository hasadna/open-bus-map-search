import { GLOBAL_SEARCH_DEFAULTS } from './globalState'
import { isCivilDate } from './time/civilDate'

describe('GLOBAL_SEARCH_DEFAULTS', () => {
  it('defaults date to a valid CivilDate', () => {
    expect(isCivilDate(GLOBAL_SEARCH_DEFAULTS.date)).toBe(true)
  })
})
