import { useTranslation } from 'react-i18next'

const BYTE_UNITS = [
  ['terabyte', 1e12],
  ['gigabyte', 1e9],
  ['megabyte', 1e6],
  ['kilobyte', 1e3],
] as const

export const useFormats = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const count = new Intl.NumberFormat(lang)
  const compact = new Intl.NumberFormat(lang, { notation: 'compact', maximumFractionDigits: 1 })
  const byteFormats = BYTE_UNITS.map(
    ([unit, size]) =>
      [
        new Intl.NumberFormat(lang, { style: 'unit', unit, maximumFractionDigits: 1 }),
        size,
      ] as const,
  )
  const plainBytes = new Intl.NumberFormat(lang, { style: 'unit', unit: 'byte' })
  const days = new Intl.NumberFormat(lang, { style: 'unit', unit: 'day', maximumFractionDigits: 1 })
  const ms = new Intl.NumberFormat(lang, { style: 'unit', unit: 'millisecond' })
  const seconds = new Intl.NumberFormat(lang, {
    style: 'unit',
    unit: 'second',
    maximumFractionDigits: 0,
  })
  const minutes = new Intl.NumberFormat(lang, {
    style: 'unit',
    unit: 'minute',
    maximumFractionDigits: 1,
  })
  const percent = new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 0 })
  const ratio = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 })
  const decimal = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 })
  const time = new Intl.DateTimeFormat(lang, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const dateTime = new Intl.DateTimeFormat(lang, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  return {
    count: (n: number) => count.format(n),
    compact: (n: number) => compact.format(n),
    /** In the largest unit that keeps the number at least 1. */
    bytes: (n: number) => {
      if (n === 0) return count.format(0)
      const fit = byteFormats.find(([, size]) => Math.abs(n) >= size)
      return fit ? fit[0].format(n / fit[1]) : plainBytes.format(n)
    },
    days: (s: number) => days.format(s / 86_400),
    ms: (n: number) => ms.format(n),
    duration: (s: number) => (s < 120 ? seconds.format(s) : minutes.format(s / 60)),
    percent: (share: number) => percent.format(share),
    ratio: (n: number) => `${ratio.format(n)}×`,
    decimal: (n: number) => decimal.format(n),
    time: (iso: string) => time.format(new Date(iso)),
    dateTime: (iso: string) => dateTime.format(new Date(iso)),
  }
}
