import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Autocomplete, TextField } from '@mui/material'
import { Operator, getOperators } from 'src/model/operator'

type OperatorSelectorProps = {
  operatorId?: string
  setOperatorId: (operatorId: string) => void
  disabled?: boolean
  filter?: string[]
}

export default function OperatorSelector({
  operatorId,
  setOperatorId,
  disabled,
  filter,
}: OperatorSelectorProps) {
  const { t } = useTranslation()
  const [operators, setOperators] = useState<Operator[]>([])

  useEffect(() => {
    getOperators(filter).then(setOperators)
  }, [filter])

  const value = operators.find((operator) => operator.id === operatorId)

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
