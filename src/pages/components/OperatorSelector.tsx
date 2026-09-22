import { Autocomplete, TextField } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAgencyList } from 'src/hooks/useAgencyList'
import { ISRAEL_TRAIN_ID, toOperators } from 'src/model/operator'

type OperatorSelectorProps = {
  operatorId?: string
  setOperatorId: (operatorId: string) => void
  disabled?: boolean
  filter?: Set<string>
  excludeIsraelRailways?: boolean
}

export default function OperatorSelector({
  operatorId,
  setOperatorId,
  disabled,
  filter,
  excludeIsraelRailways,
}: OperatorSelectorProps) {
  const { t } = useTranslation()
  const agencies = useAgencyList()

  const operators = useMemo(() => {
    const operators = toOperators(agencies, filter)
    return excludeIsraelRailways
      ? operators.filter((operator) => operator.id !== ISRAEL_TRAIN_ID)
      : operators
  }, [agencies, filter, excludeIsraelRailways])

  useEffect(() => {
    if (excludeIsraelRailways && operatorId === ISRAEL_TRAIN_ID) {
      setOperatorId('')
    }
  }, [excludeIsraelRailways, operatorId, setOperatorId])

  const value = operators.find((operator) => operator.id === operatorId) || null

  return (
    <Autocomplete
      disablePortal
      disabled={disabled}
      fullWidth
      value={value}
      onChange={(_, value) => setOperatorId(value ? value.id : '')}
      id="operator-select"
      options={operators}
      renderInput={(params) => <TextField {...params} label={t('choose_operator')} />}
      getOptionLabel={(option) => option.name}
    />
  )
}
