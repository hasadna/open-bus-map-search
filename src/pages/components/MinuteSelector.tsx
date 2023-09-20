import React from 'react'
import { TEXTS } from 'src/resources/texts'
import { TextField } from '@mui/material'

type MinuteSelectorProps = {
  num: number
  setNum: (num: string) => void
}

const MinuteSelector = ({ num, setNum }: MinuteSelectorProps) => {
  return (
    <TextField
      sx={{ width: '100%' }}
      label={TEXTS.minutes}
      type="number"
      value={num}
      onChange={(e) => setNum(e.target.value)}
      InputLabelProps={{
        shrink: true,
      }}
    />
  )
}

export default MinuteSelector
