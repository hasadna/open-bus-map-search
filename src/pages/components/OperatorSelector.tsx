import { Autocomplete, TextField } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GlobalSearchContext } from 'src/model/globalState'
import { getOperators, ISRAEL_TRAIN_ID, Operator } from 'src/model/operator'

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
  const {
    search: { date },
  } = useContext(GlobalSearchContext)
  const [operators, setOperators] = useState<Operator[]>([])

  useEffect(() => {
    getOperators(new Date(date), filter).then((operators) =>
      setOperators(
        excludeIsraelRailways
          ? operators.filter((operator) => operator.id !== ISRAEL_TRAIN_ID)
          : operators,
      ),
    )
  }, [filter, excludeIsraelRailways, date])

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
