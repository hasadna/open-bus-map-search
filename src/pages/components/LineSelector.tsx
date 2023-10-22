import React, { useCallback, useLayoutEffect, useState } from 'react'
import { TEXTS } from 'src/resources/texts'
import debounce from 'lodash.debounce'
import { TextField } from '@mui/material'
import ClearButton from './ClearButton'

type LineSelectorProps = {
  lineNumber: string | undefined
  setLineNumber: (lineNumber: string) => void
}

const LineSelector = ({ lineNumber, setLineNumber }: LineSelectorProps) => {
  const [value, setValue] = useState<LineSelectorProps['lineNumber']>(lineNumber)
  const debouncedSetLineNumber = useCallback(debounce(setLineNumber, 200), [setLineNumber])

  useLayoutEffect(() => {
    setValue(lineNumber)
  }, [])

  const handleClearInput = () => {
    setValue('')
    setLineNumber('')
  }

  return (
    <TextField
      className="textInput"
      sx={{
        width: '100%',
        '&:hover .clearIndicatorDirty, & .Mui-focused .clearIndicatorDirty': {
          visibility: value ? 'visible' : 'hidden',
        },
      }}
      label={TEXTS.choose_line}
      type="number"
      value={value && +value < 0 ? 0 : value}
      onChange={(e) => {
        setValue(e.target.value)
        debouncedSetLineNumber(e.target.value)
      }}
      InputLabelProps={{
        shrink: true,
      }}
      InputProps={{
        placeholder: TEXTS.line_placeholder,
        endAdornment: <ClearButton onClearInput={handleClearInput} />,
      }}
    />
  )
}

export default LineSelector
