import React from 'react'
import { Select } from 'antd'
import agencyList from 'open-bus-stride-client/agencies/agencyList'
import { TEXTS } from 'src/resources/texts'
import styled from 'styled-components'
import { RadioGroupOptionType } from 'antd/lib/radio'
import { DefaultOptionType } from 'rc-select/lib/Select'

const getOperatorId = (name: string) => agencyList.find((a) => a.agency_name === name)!.agency_id

type Operator = {
  name: string
  id: string
}

const toOperator = (name: string): Operator => ({ name, id: getOperatorId(name) })

const RELEVANT_OPERATORS: Operator[] = [
  toOperator('אגד'),
  toOperator('אגד תעבורה'),
  toOperator('דן'),
  toOperator('נתיב אקספרס'),
  toOperator('מטרופולין'),
  toOperator('סופרבוס'),
  toOperator('קווים'),
  toOperator('אלקטרה אפיקים'),
].sort((a, b) => a.name.localeCompare(b.name))

type OperatorSelectorProps = {
  operatorId?: string
  setOperatorId: (operatorId: string) => void
}

const StyledSelect = styled(Select<string, DefaultOptionType>)`
  width: 360px;
  cursor: pointer;
`

const OperatorSelector = ({ operatorId, setOperatorId }: OperatorSelectorProps) => {
  return (
    <StyledSelect
      placeholder={TEXTS.choose_operator}
      value={operatorId}
      onSelect={(value: string) => setOperatorId(value)}
      showSearch
      filterOption
      optionFilterProp="children">
      {RELEVANT_OPERATORS.map((agency) => (
        <Select.Option key={agency.id} value={agency.id}>
          {agency.name}
        </Select.Option>
      ))}
    </StyledSelect>
  )
}

export default OperatorSelector
