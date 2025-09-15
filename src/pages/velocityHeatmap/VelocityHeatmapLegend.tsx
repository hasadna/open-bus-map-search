import React from 'react'

export const VelocityHeatmapLegend: React.FC = () => (
  <div style={{ margin: '16px 0', maxWidth: 400, position: 'relative', zIndex: 1000 }}>
    <h3>Velocity Color Legend (km/h)</h3>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12 }}>0</span>
      <div
        style={{
          flex: 1,
          height: 16,
          background: 'linear-gradient(to right, blue, green, red)',
        }}
      />
      <span style={{ fontSize: 12 }}>120+</span>
    </div>
  </div>
)
