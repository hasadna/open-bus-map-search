import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Autocomplete, TextField } from '@mui/material'
import { Operator, getOperators } from 'src/model/operator'

type OperatorSelectorProps = {
  operatorId?: string
  setOperatorId: (operatorId: string) => void
  filter?: string[]
}

export default function OperatorSelector({
  operatorId,
  setOperatorId,
  filter,
}: OperatorSelectorProps) {
  const { t } = useTranslation()
  const [operators, setOperators] = useState<Operator[]>([])

  useEffect(() => {
    getOperators(filter).then((o) => setOperators(o))
  }, [filter])

  const valueFinned = operators.find((operator) => operator.id === operatorId)
  const value = valueFinned ? valueFinned : null

  return (
    <Autocomplete
      disablePortal
      style={{ width: '100%' }}
      value={value}
      onChange={(_, value) => setOperatorId(value ? value.id : '')}
      id="operator-select"
      options={operators}
      renderInput={(params) => <TextField {...params} label={t('choose_operator')} />}
      getOptionLabel={(option) => option.name}
    />
  )
}
