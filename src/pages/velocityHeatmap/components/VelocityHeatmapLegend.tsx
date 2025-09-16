import React from 'react'

type VisMode = 'avg' | 'std' | 'cv'

const LEGEND_LABELS: Record<VisMode, string> = {
  avg: 'Avg Speed (km/h)',
  std: 'Std Dev (km/h)',
  cv: 'Coeff. of Var (avg/std)',
}

interface VelocityHeatmapLegendProps {
  visMode: VisMode
  min: number
  max: number
}

export const VelocityHeatmapLegend: React.FC<VelocityHeatmapLegendProps> = ({
  visMode,
  min,
  max,
}) => (
  <div style={{ margin: '16px 0', maxWidth: 400, position: 'absolute', bottom: 50, zIndex: 1000 }}>
    <h3>Red Opacity Legend</h3>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12 }}>{min.toFixed(1)}</span>
      <div
        style={{
          flex: 1,
          height: 16,
          background: 'linear-gradient(to left, rgba(255,0,0,0), rgba(255,0,0,1))',
        }}
      />
      <span style={{ fontSize: 12 }}>{max.toFixed(1)}</span>
    </div>
    <div style={{ fontSize: 12, marginTop: 4 }}>{LEGEND_LABELS[visMode]}</div>
  </div>
)
