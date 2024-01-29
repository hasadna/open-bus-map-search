import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Operator, getRelevantOperators } from 'src/model/operator'
import { Autocomplete, TextField } from '@mui/material'

export enum FilterOperatorOptions {
  ALL,
  RELEVANT,
  MAJOR,
}

type OperatorSelectorProps = {
  operatorId?: string
  setOperatorId: (operatorId: string) => void
  filter?: FilterOperatorOptions
}

const OperatorSelector = ({
  operatorId,
  setOperatorId,
  filter = FilterOperatorOptions.RELEVANT,
}: OperatorSelectorProps) => {
  const { t } = useTranslation()
  const [operators, setOperators] = useState<Operator[]>([])
  useEffect(() => {
    const majorOperatorsIds = ['3', '5', '15', '18', '25', '34']
    getRelevantOperators(filter != FilterOperatorOptions.ALL)
      .then((list) =>
        filter === FilterOperatorOptions.ALL
          ? [...list, { id: '', name: t('operatorSelectorOptions.all') }]
          : list,
      )
      .then((resultObj) =>
        setOperators(
          filter == FilterOperatorOptions.MAJOR && resultObj
            ? resultObj.filter((item) => majorOperatorsIds.includes(item.id))
            : resultObj,
        ),
      )
  }, [filter == FilterOperatorOptions.MAJOR])

  const valueFinned = operators.find((operator) => operator.id === operatorId)
  const value = valueFinned ? valueFinned : null

  return (
    <Autocomplete
      disablePortal
      style={{ width: '100%' }}
      value={value}
      onChange={(e, value) => setOperatorId(value ? value.id : '')}
      id="operator-select"
      options={operators}
      renderInput={(params) => <TextField {...params} label={t('choose_operator')} />}
      getOptionLabel={(option) => option.name}
    />
  )
}

export default OperatorSelector
