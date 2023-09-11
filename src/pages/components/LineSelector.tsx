import React, { useCallback } from 'react'
import { TEXTS } from 'src/resources/texts'
import { INPUT_SIZE } from 'src/resources/sizes'
import debounce from 'lodash.debounce'
import { TextField } from '@mui/material'

type LineSelectorProps = {
  lineNumber: string | undefined
  setLineNumber: (lineNumber: string) => void
}

const LineSelector = ({ lineNumber, setLineNumber }: LineSelectorProps) => {
  const debouncedSetLineNumber = useCallback(debounce(setLineNumber), [setLineNumber])

  const value = lineNumber ? lineNumber : ''

  return (
    <TextField
      sx={{ width: INPUT_SIZE }}
      label={TEXTS.choose_line}
      type="number"
      value={value}
      onChange={(e) => debouncedSetLineNumber(e.target.value)}
      InputLabelProps={{
        shrink: true,
      }}
    />
  )
}

export default LineSelector
