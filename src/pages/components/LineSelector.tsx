import { TextField } from '@mui/material'
import classNames from 'classnames'
import debounce from 'lodash.debounce'
import { useCallback, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ClearButton from './ClearButton'
import './Selector.scss'

type LineSelectorProps = {
  disabled?: boolean
  lineNumber: string | undefined
  setLineNumber: (lineNumber: string) => void
}

const LineSelector = ({ disabled, lineNumber, setLineNumber }: LineSelectorProps) => {
  const [value, setValue] = useState<LineSelectorProps['lineNumber']>(lineNumber)
  const debouncedSetLineNumber = useCallback(debounce(setLineNumber, 500), [setLineNumber])
  const { t } = useTranslation()

  useLayoutEffect(() => {
    setValue(lineNumber)
  }, [])

  const handleClearInput = () => {
    setValue('')
    setLineNumber('')
  }

  const textFieldClass = classNames({
    'selector-line-text-field': true,
    'selector-line-text-field_visible': value,
    'selector-line-text-field_hidden': !value,
  })
  return (
    <TextField
      disabled={disabled}
      className={textFieldClass}
      label={t('choose_line')}
      type="text"
      value={value && +value < 0 ? 0 : value}
      onChange={(e) => {
        setValue(e.target.value)
        debouncedSetLineNumber(e.target.value)
      }}
      slotProps={{
        inputLabel: {
          shrink: true,
        },
        input: {
          placeholder: t('line_placeholder'),
          endAdornment: <ClearButton onClearInput={handleClearInput} />,
        },
      }}
    />
  )
}

export default LineSelector
