import { HDate } from '@hebcal/core'

export function getHebrewDate(date: Date): string {
  const hdate = new HDate(date)
  return hdate.renderGematriya()
}
