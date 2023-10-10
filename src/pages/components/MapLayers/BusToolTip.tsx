import React from 'react'
import { Point } from 'src/pages/RealtimeMapPage'
import { Card, CardContent, Typography } from '@mui/material'
import { DivIcon } from 'leaflet'

export function BusToolTip({ position, icon }: { position: Point; icon: DivIcon }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          <div dangerouslySetInnerHTML={{ __html: icon.options.html as string }} />
        </Typography>
        <Typography variant="body2">
          This is a nice card with some content. You can customize it further.
        </Typography>
      </CardContent>
    </Card>
  )
}
