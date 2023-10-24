import React from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import { IconButton } from '@mui/material'
import './ClearButton.scss'

const ClearButton = ({ onClearInput }: { onClearInput: () => void }) => {
  return (
    <IconButton onClick={onClearInput} size="small" className="clear-indicator">
      <ClearIcon fontSize="small" />
    </IconButton>
  )
}

export default ClearButton
