import React from 'react'
import { Select } from 'antd'

const children: React.ReactNode[] = []
for (let i = 10; i < 36; i++) {
  children.push(<Select.Option key={i}>{i}</Select.Option>)
}

const LineSelector = () => {
  return <Select placeholder="Select line number">{children}</Select>
}

export default LineSelector
