const ROUTE_PATTERN = /^(.*?)<->(.*?)-([^-]+)$/

export const routeStartEnd = (routeLongName?: string) => {
  const [, start = '', end = '', suffix = ''] = routeLongName?.match(ROUTE_PATTERN) ?? []
  return [start.trim(), end.trim(), suffix.trim()] as [start: string, end: string, suffix: string]
}
