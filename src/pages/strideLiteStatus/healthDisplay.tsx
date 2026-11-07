import {
  BedtimeTwoTone,
  CheckCircleTwoTone,
  CloudOffTwoTone,
  ErrorTwoTone,
  WarningTwoTone,
} from '@mui/icons-material'
import type { DayHealth } from './coverageHealth'

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
