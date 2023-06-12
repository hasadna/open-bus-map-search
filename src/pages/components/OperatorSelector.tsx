import React from 'react'
import { Select } from 'antd'
import { TEXTS } from 'src/resources/texts'
import styled from 'styled-components'
import { DefaultOptionType } from 'rc-select/lib/Select'
import { Operator, RELEVANT_OPERATORS } from 'src/model/operator'
import { INPUT_SIZE } from 'src/resources/sizes'

type OperatorSelectorProps = {
  operatorId?: string
  setOperatorId: (operatorId: string) => void
}

const StyledSelect = styled(Select<string, DefaultOptionType>)`
  width: ${INPUT_SIZE}px;
`

const OperatorSelector = ({ operatorId, setOperatorId }: OperatorSelectorProps) => {
  const [operators, setOperators] = React.useState<Operator[]>([])

  React.useEffect(() => {
    RELEVANT_OPERATORS.then(setOperators)
  }, [])

  return (
    <StyledSelect
      placeholder={TEXTS.operator_placeholder}
      value={operatorId}
      onSelect={(value: string) => setOperatorId(value)}
      showSearch
      filterOption
      optionFilterProp="children">
      {operators.map((agency) => (
        <Select.Option key={agency.id} value={agency.id}>
          {agency.name}
        </Select.Option>
      ))}
    </StyledSelect>
  )
}

export default OperatorSelector
