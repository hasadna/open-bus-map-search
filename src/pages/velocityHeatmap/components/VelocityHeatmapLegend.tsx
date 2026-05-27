import { useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'

type VisMode = 'avg' | 'std' | 'cv'

interface VelocityHeatmapLegendProps {
  visMode: VisMode
  min: number
  max: number
}

export const VelocityHeatmapLegend = ({ visMode, min, max }: VelocityHeatmapLegendProps) => {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 50,
        // Pin to the inline-start side so the legend mirrors with the layout
        // (bottom-left in LTR, bottom-right in RTL).
        left: isRtl ? undefined : 10,
        right: isRtl ? 10 : undefined,
        zIndex: 1000,
        maxWidth: 300,
        background: isDark ? 'rgba(30, 30, 30, 0.92)' : 'rgba(255, 255, 255, 0.9)',
        color: isDark ? '#fff' : 'rgba(0, 0, 0, 0.87)',
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
      }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        {t(`velocity_legend_${visMode}`)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11 }}>{min.toFixed(1)}</span>
        <div
          style={{
            flex: 1,
            height: 12,
            borderRadius: 4,
            background: 'linear-gradient(to left, rgba(255,0,0,0), rgba(255,0,0,1))',
          }}
        />
        <span style={{ fontSize: 11 }}>{max.toFixed(1)}</span>
      </div>
    </div>
  )
}
