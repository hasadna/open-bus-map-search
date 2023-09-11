import React from 'react'
import { TEXTS } from 'src/resources/texts'
import { INPUT_SIZE } from 'src/resources/sizes'
import { TextField } from '@mui/material'

type MinuteSelectorProps = {
  num: number
  setNum: (num: string) => void
}

const MinuteSelector = ({ num, setNum }: MinuteSelectorProps) => {
  return (
    <TextField
      sx={{ width: INPUT_SIZE }}
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
