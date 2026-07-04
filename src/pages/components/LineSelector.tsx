import { Autocomplete, TextField } from '@mui/material'
import { debounce } from 'es-toolkit/compat'
import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAllRoutes } from 'src/hooks/useAllRoutes'

type LineSelectorProps = {
  disabled?: boolean
  operatorId?: string
  date?: string
  lineNumber: string | undefined
  setLineNumber: (lineNumber: string) => void
}

const LineSelector = ({
  disabled,
  operatorId,
  date,
  lineNumber,
  setLineNumber,
}: LineSelectorProps) => {
  const [value, setValue] = useState<string>(lineNumber ?? '')
  const debouncedSetLineNumber = useCallback(debounce(setLineNumber, 500), [setLineNumber])
  const { t } = useTranslation()
  const { routes, isLoading } = useAllRoutes(operatorId, date)

  useLayoutEffect(() => {
    setValue(lineNumber ?? '')
  }, [])

  // Distinct line numbers running for the selected operator + date. `routes` is
  // already sorted by line number in useAllRoutes, so a Set preserves that order.
  const options = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const route of routes) {
      if (!route.line) continue
      const label = `${route.line}${route.suffix}`
      if (!seen.has(label)) {
        seen.add(label)
        result.push(label)
      }
    }
    return result
  }, [routes])

  return (
    <Autocomplete
      freeSolo
      forcePopupIcon
      disablePortal
      fullWidth
      disabled={disabled}
      loading={isLoading}
      options={options}
      // Tag MUI's built-in clear button with the repo-wide `clear-indicator`
      // class (the same hook VehicleSelector's ClearButton and Selector.scss use)
      // so the e2e `clearInputField` helper can find it.
      slotProps={{ clearIndicator: { className: 'clear-indicator' } }}
      inputValue={value}
      onInputChange={(_event, newValue, reason) => {
        setValue(newValue)
        if (reason === 'input') {
          debouncedSetLineNumber(newValue)
        } else if (reason === 'clear') {
          debouncedSetLineNumber.cancel()
          setLineNumber('')
        }
      }}
      onChange={(_event, newValue) => {
        debouncedSetLineNumber.cancel()
        setValue(newValue ?? '')
        setLineNumber(newValue ?? '')
      }}
      renderInput={(params) => (
        <TextField {...params} label={t('choose_line')} placeholder={t('line_placeholder')} />
      )}
    />
  )
}

export default LineSelector
