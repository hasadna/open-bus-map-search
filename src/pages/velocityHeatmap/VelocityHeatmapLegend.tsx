import { useTranslation } from 'react-i18next'

type VisMode = 'avg' | 'std' | 'cv'

interface VelocityHeatmapLegendProps {
  visMode: VisMode
}

export const VelocityHeatmapLegend: React.FC<VelocityHeatmapLegendProps> = ({
  visMode,
}: VelocityHeatmapLegendProps) => {
  const { t } = useTranslation()
  return (
    <div style={{ margin: '16px 0', maxWidth: 400, position: 'relative', zIndex: 1000 }}>
      <h3>{t('velocity_legend_title')}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12 }}>0</span>
        <div
          style={{
            flex: 1,
            height: 16,
            background: 'linear-gradient(to right, rgba(255,0,0,0), rgba(255,0,0,1))',
          }}
        />
        <span style={{ fontSize: 12 }}>1</span>
      </div>
      <div style={{ fontSize: 12, marginTop: 4 }}>{t(`velocity_legend_${visMode}`)}</div>
    </div>
  )
}
