import * as React from 'react'
import { styled } from '@mui/material/styles'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
  language: string
}

export const ExpandMore = styled((props: ExpandMoreProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { expand, language, ...other } = props
  return (
    <IconButton {...other}>
      <ExpandMoreIcon />
    </IconButton>
  )
})(({ theme, expand, language }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  right: language === 'he' ? '1rem' : '-1rem',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}))
