import React from 'react'
import { TEXTS } from 'src/resources/texts'
import { TextField } from '@mui/material'
import ClearButton from './ClearButton'
import './Selector.scss'
import classNames from 'classnames'

type MinuteSelectorProps = {
  num: number
  setNum: (num: number) => void
}

const MinuteSelector = ({ num, setNum }: MinuteSelectorProps) => {
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
      label={TEXTS.minutes}
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
