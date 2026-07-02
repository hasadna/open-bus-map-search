import { Close as ClearIcon } from '@mui/icons-material'
import './ClearButton.scss'

const ClearButton = ({ onClearInput }: { onClearInput: () => void }) => {
  return <ClearIcon onClick={onClearInput} className="clear-indicator" />
}

export default ClearButton
