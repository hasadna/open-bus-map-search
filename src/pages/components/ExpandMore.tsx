import * as React from 'react'
import { styled } from '@mui/material/styles'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}

export const ExpandMore = styled((props: ExpandMoreProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { expand, ...other } = props
  return (
    <IconButton sx={{ left: '-1rem' }} {...other}>
      <ExpandMoreIcon />
    </IconButton>
  )
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}))
