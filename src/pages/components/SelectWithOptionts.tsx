import styled from 'styled-components'
import { Select } from 'antd'
import { DefaultOptionType } from 'rc-select/lib/Select'
import React from 'react'

type SelectorProps<T> = {
  items: T[]
  selected: string | undefined
  setSelected: (selected: string) => void
  placeholder: string
  getItemKey: (item: T) => string
  getItemDisplay: (item: T) => string
}

const StyledSelect = styled(Select<string, DefaultOptionType>)``

const SelectWithOptions = <T,>({
  items,
  selected,
  setSelected,
  placeholder,
  getItemKey,
  getItemDisplay,
}: SelectorProps<T>) => {
  return (
    <StyledSelect
      placeholder={placeholder}
      value={selected}
      onSelect={(selected: string) => setSelected(selected)}
      showSearch
      filterOption
      optionFilterProp="children">
      {items.map((item) => (
        <Select.Option key={getItemKey(item)} value={getItemKey(item)} title={getItemDisplay(item)}>
          {getItemDisplay(item)}
        </Select.Option>
      ))}
    </StyledSelect>
  )
}

export default SelectWithOptions
