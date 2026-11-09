import {
  BedtimeTwoTone,
  CheckCircleTwoTone,
  CloudOffTwoTone,
  ErrorTwoTone,
  WarningTwoTone,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import type { DayHealth, HealthReason } from './coverageHealth'

/** Reserved status steps (good / warning / serious / critical), which hold their contrast on
 *  both surfaces; only `quiet` — a normal day, just a thin one — takes a plain series hue, so
 *  a quiet Shabbat never wears a fault colour. */
export const healthColor = (health: DayHealth, isDark: boolean): string => {
  switch (health) {
    case 'ok':
      return '#0ca30c'
    case 'quiet':
      return isDark ? '#3987e5' : '#2a78d6'
    case 'shortDownload':
      return '#fab219'
    case 'noData':
      return '#ec835a'
    case 'pipelineFault':
      return '#d03b3b'
  }
}

export const HealthIcon = ({ health }: { health: DayHealth }) => {
  const props = { fontSize: 'small' as const, sx: { color: 'inherit' } }
  switch (health) {
    case 'ok':
      return <CheckCircleTwoTone {...props} />
    case 'quiet':
      return <BedtimeTwoTone {...props} />
    case 'shortDownload':
      return <WarningTwoTone {...props} />
    case 'noData':
      return <CloudOffTwoTone {...props} />
    case 'pipelineFault':
      return <ErrorTwoTone {...props} />
  }
}

export const healthLabelKey = (health: DayHealth) => `strideLite.health.${health}` as const

/** One sentence saying why a day got its reading; a healthy day gets one too, so the tooltip
 *  never leaves a reading unexplained. */
export const useHealthReasonText = () => {
  const { t, i18n } = useTranslation()
  const full = new Intl.NumberFormat(i18n.language)
  return (reason: HealthReason | undefined): string => {
    if (!reason) return t('strideLite.reason.ok')
    switch (reason.key) {
      case 'noSnapshots':
        return t('strideLite.reason.noSnapshots')
      case 'duplicateIds':
        return t('strideLite.reason.duplicateIds', { n: full.format(reason.count) })
      case 'noLocations':
        return t('strideLite.reason.noLocations')
      case 'shortDownload':
        return t('strideLite.reason.shortDownload', { missing: full.format(reason.missing) })
      case 'quiet':
        return t('strideLite.reason.quiet', { percent: reason.percent })
    }
  }
}
