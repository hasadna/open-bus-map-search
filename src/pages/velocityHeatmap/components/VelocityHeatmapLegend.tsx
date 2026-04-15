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
  <div
    style={{
      position: 'absolute',
      bottom: 50,
      left: 10,
      zIndex: 1000,
      maxWidth: 300,
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 8,
      padding: '8px 12px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      border: '1px solid rgba(0,0,0,0.1)',
    }}>
    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{LEGEND_LABELS[visMode]}</div>
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
