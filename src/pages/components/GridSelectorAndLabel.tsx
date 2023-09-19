import React from 'react'
import { Label } from 'src/pages/components/Label'
import Grid from '@mui/material/Unstable_Grid2'

export function GridSelectorAndLabel(props: { label: string; children: React.ReactNode }) {
  return (
    <>
      <Grid xs={4}>
        <Label text={props.label} />
      </Grid>
      <Grid xs={8}>{props.children}</Grid>
    </>
  )
}
