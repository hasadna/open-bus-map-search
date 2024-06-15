import { useTranslation } from 'react-i18next'
import { TextField } from '@mui/material'
import classNames from 'classnames'
import ClearButton from './ClearButton'
import './Selector.scss'

type MinuteSelectorProps = {
  num: number
  setNum: (num: number) => void
}

const MinuteSelector = ({ num, setNum }: MinuteSelectorProps) => {
  const { t } = useTranslation()
  const handleClearInput = () => {
    setNum(1) // 1 minute this is the wanted default value
  }
  const textFieldClass = classNames({
    'selector-minute-text-field': true,
    'selector-minute-text-field_visible': num,
    'selector-minute-text-field_hidden': !num,
  })
  return (
    <TextField
      className={textFieldClass}
      label={t('minutes')}
      type="number"
      value={num}
      onChange={(e) => setNum(+e.target.value)}
      InputLabelProps={{
        shrink: true,
      }}
      InputProps={{
        endAdornment: <ClearButton onClearInput={handleClearInput} />,
      }}
    />
  )
}

export default MinuteSelector
