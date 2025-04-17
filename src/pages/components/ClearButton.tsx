import { CloseOutlined as ClearIcon } from '@ant-design/icons'
import './ClearButton.scss'

interface ClearButtonProps {
  onClearInput: () => void
  disabled?: boolean
}

const ClearButton = ({ onClearInput, disabled }: ClearButtonProps) => {
  return <ClearIcon onClick={onClearInput} disabled={disabled} className="clear-indicator" />
}

export default ClearButton
