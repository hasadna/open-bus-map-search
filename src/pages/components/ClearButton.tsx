import React from 'react'
import { CloseOutlined as ClearIcon } from '@ant-design/icons'
import './ClearButton.scss'

const ClearButton = ({ onClearInput }: { onClearInput: () => void }) => {
  return <ClearIcon onClick={onClearInput} className="clear-indicator" />
}

export default ClearButton
