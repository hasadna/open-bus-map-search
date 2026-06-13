import { useTranslation } from 'react-i18next'

type VisMode = 'avg' | 'std' | 'cv'

interface VelocityHeatmapLegendProps {
  visMode: VisMode
  min: number
  max: number
}

// Positioning, box chrome and dark theming come from MapShell's `.map-legend`
// slot — this component is only the legend content.
export const VelocityHeatmapLegend = ({ visMode, min, max }: VelocityHeatmapLegendProps) => {
  const { t } = useTranslation()

  return (
    <div style={{ minWidth: 200, maxWidth: 300 }}>
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
