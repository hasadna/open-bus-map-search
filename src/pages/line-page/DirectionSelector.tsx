import { Select } from 'antd'
import React from 'react'

const DirectionSelector = () => {
  return (
    <Select placeholder="Select Direction">
      <Select.Option key="f">Forward</Select.Option>
      <Select.Option key="b">Backward</Select.Option>
    </Select>
  )
}

export default DirectionSelector
