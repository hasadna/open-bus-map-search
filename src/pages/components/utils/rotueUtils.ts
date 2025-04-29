const ROUTE_PATTERN = /^(.*?)<->(.*?)-([^-]+)$/

export const routeStartEnd = (routeLongName?: string) => {
  const [, start = '', end = '', suffix = ''] = routeLongName?.match(ROUTE_PATTERN) ?? []
  return [start.trim(), end.trim(), suffix.trim()] as [start: string, end: string, suffix: string]
}

export const vehicleIDFormat = (id?: number | string): string => {
  if (!id) return ''
  const d = String(id)
  if (d.length === 7) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 8)}`
  if (d.length === 8) return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5, 9)}`
  return d
}
