import React from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import { IconButton } from '@mui/material'

const ClearButton = ({ onClearInput }: { onClearInput: () => void }) => {
  return (
    <IconButton
      onClick={onClearInput}
      size="small"
      className="clearIndicatorDirty"
      sx={{
        visibility: 'hidden',
        position: 'absolute',
        right: '32px',
      }}>
      <ClearIcon fontSize="small" />
    </IconButton>
  )
}

export default ClearButton
