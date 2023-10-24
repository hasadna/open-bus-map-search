import React from 'react'
import { TEXTS } from 'src/resources/texts'
import { TextField } from '@mui/material'
import ClearButton from './ClearButton'

type MinuteSelectorProps = {
  num: number
  setNum: (num: number) => void
}

const MinuteSelector = ({ num, setNum }: MinuteSelectorProps) => {
  const handleClearInput = () => {
    setNum(0)
  }

  return (
    <TextField
      sx={{
        width: '100%',
        '&:hover .clearIndicatorDirty , & .Mui-focused .clearIndicatorDirty ': {
          visibility: num ? 'visible' : 'hidden',
        },
      }}
      label={TEXTS.minutes}
      type="number"
      value={num}
      onChange={(e) => setNum(+e.target.value)}
      InputLabelProps={{
        shrink: true,
      }}
      InputProps={{
        endAdornment: <ClearButton onClearInput={handleClearInput} />,
      }}
    />
  )
}

export default MinuteSelector
