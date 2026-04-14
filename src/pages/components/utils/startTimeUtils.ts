export type StartTimeToken = {
  scheduledTime: string
  vehicleRef?: string
  lineRef?: string
}

export function normalizeScheduledTime(raw?: string): string | undefined {
  if (!raw) return undefined

  const normalized = raw.replaceAll('-', ':')
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(normalized)
  if (!match) return undefined

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return undefined
  }

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

export function parseStartTimeToken(token?: string): StartTimeToken | undefined {
  if (!token) return undefined

  const [rawScheduledTime, vehicleRef, lineRef] = token.split('|')
  const scheduledTime = normalizeScheduledTime(rawScheduledTime)
  if (!scheduledTime) return undefined

  return {
    scheduledTime,
    vehicleRef: vehicleRef || undefined,
    lineRef: lineRef || undefined,
  }
}

export function normalizeStartTimeToken(token?: string): string | undefined {
  const parsed = parseStartTimeToken(token)
  if (!parsed) return undefined

  const { scheduledTime, vehicleRef, lineRef } = parsed
  if (vehicleRef && lineRef) return `${scheduledTime}|${vehicleRef}|${lineRef}`
  if (vehicleRef) return `${scheduledTime}|${vehicleRef}`
  return scheduledTime
}

export function formatStartTimeForQuery(time?: string): string {
  return normalizeScheduledTime(time)?.replaceAll(':', '-') || ''
}
