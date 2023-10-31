import { useEffect, useState } from 'react'
import { TEXTS } from 'src/resources/texts'
import { Operator, RELEVANT_OPERATORS } from 'src/model/operator'
import { Autocomplete, TextField } from '@mui/material'

type OperatorSelectorProps = {
  operatorId?: string
  setOperatorId: (operatorId: string) => void
  onlyMajorOperators?: boolean
}

const OperatorSelector = ({
  operatorId,
  setOperatorId,
  onlyMajorOperators = false,
}: OperatorSelectorProps) => {
  const [operators, setOperators] = useState<Operator[]>([])
  useEffect(() => {
    const majorOperatorsIds = ['3', '5', '15', '18', '25']
    RELEVANT_OPERATORS.then((resultObj) =>
      setOperators(
        onlyMajorOperators
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
      onChange={(e, value) => setOperatorId(value ? value.id : '0')}
      id="operator-select"
      options={operators}
      renderInput={(params) => <TextField {...params} label={TEXTS.choose_operator} />}
      getOptionLabel={(option) => option.name}
    />
  )
}

export default OperatorSelector
