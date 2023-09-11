import React from 'react'
import { TEXTS } from 'src/resources/texts'
import { Operator, RELEVANT_OPERATORS } from 'src/model/operator'
import { Autocomplete, TextField } from '@mui/material'
import { INPUT_SIZE } from 'src/resources/sizes'

type OperatorSelectorProps = {
  operatorId?: string
  setOperatorId: (operatorId: string) => void
}

const OperatorSelector = ({ operatorId, setOperatorId }: OperatorSelectorProps) => {
  const [operators, setOperators] = React.useState<Operator[]>([])

  React.useEffect(() => {
    RELEVANT_OPERATORS.then(setOperators)
  }, [])

  const valueFinned = operators.find((operator) => operator.id === operatorId)
  const value = valueFinned ? valueFinned : null

  return (
    <Autocomplete
      disablePortal
      value={value}
      onChange={(e, value) => setOperatorId(value ? value.id : '0')}
      id="operator-select"
      sx={{ width: INPUT_SIZE }}
      options={operators}
      renderInput={(params) => <TextField {...params} label={TEXTS.choose_operator} />}
      getOptionLabel={(option) => option.name}
    />
  )
}

export default OperatorSelector
