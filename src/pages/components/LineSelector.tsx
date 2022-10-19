import React, { useCallback } from 'react'
import { Input } from 'antd'
import { TEXTS } from 'src/resources/texts'
import styled from 'styled-components'
import { INPUT_SIZE } from 'src/resources/sizes'
import debounce from 'lodash.debounce'

type LineSelectorProps = {
  lineNumber: string | undefined
  setLineNumber: (lineNumber: string) => void
}

const StyledInput = styled(Input)`
  width: ${INPUT_SIZE}px;
`

const LineSelector = ({ lineNumber, setLineNumber }: LineSelectorProps) => {
  const debouncedSetLineNumber = useCallback(debounce(setLineNumber), [setLineNumber])
  return (
    <StyledInput
      placeholder={TEXTS.line_placeholder}
      value={lineNumber}
      onChange={(e) => debouncedSetLineNumber(e.target.value)}
    />
  )
}

export default LineSelector
