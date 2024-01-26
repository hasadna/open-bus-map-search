import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Operator, getRelevantOperators } from 'src/model/operator'
import { Autocomplete, TextField } from '@mui/material'

enum FilterOperatorOptions {
  ALL = 0,
  RELEVANT = 1,
  MAJOR = 2,
}

type OperatorSelectorProps = {
  operatorId?: string
  setOperatorId: (operatorId: string) => void
  onlyMajorOperators?: boolean
  filter?: FilterOperatorOptions
}

const OperatorSelector = ({
  operatorId,
  setOperatorId,
  onlyMajorOperators = false,
  filter = FilterOperatorOptions.MAJOR
}: OperatorSelectorProps) => {
  const { t } = useTranslation()
  const [operators, setOperators] = useState<Operator[]>([])
  useEffect(() => {
    const majorOperatorsIds = ['3', '5', '15', '18', '25', '34']
    getRelevantOperators(filter != FilterOperatorOptions.ALL).then((resultObj) =>
      setOperators(
        onlyMajorOperators && resultObj
          ? resultObj.filter((item) => majorOperatorsIds.includes(item.id))
          : resultObj,
      ),
    )
  }, [onlyMajorOperators])

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
