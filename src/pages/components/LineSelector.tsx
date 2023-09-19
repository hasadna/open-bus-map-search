import React, { useCallback, useLayoutEffect, useState } from 'react'
import { TEXTS } from 'src/resources/texts'
import debounce from 'lodash.debounce'
import { TextField } from '@mui/material'

type LineSelectorProps = {
  lineNumber: string | undefined
  setLineNumber: (lineNumber: string) => void
}

const LineSelector = ({ lineNumber, setLineNumber }: LineSelectorProps) => {
  const [value, setValue] = useState<LineSelectorProps['lineNumber']>()
  const debouncedSetLineNumber = useCallback(debounce(setLineNumber, 200), [setLineNumber])

  useLayoutEffect(() => {
    setValue(lineNumber)
  }, [])

  return (
    <TextField
      sx={{ width: '100%' }}
      label={TEXTS.choose_line}
      type="number"
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
        debouncedSetLineNumber(e.target.value)
      }}
      InputLabelProps={{
        shrink: true,
      }}
      InputProps={{
        placeholder: TEXTS.line_placeholder,
      }}
    />
  )
}

export default LineSelector
