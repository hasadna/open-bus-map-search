import { TextField } from '@mui/material'
import classNames from 'classnames'
import debounce from 'lodash.debounce'
import { useCallback, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ClearButton from './ClearButton'
import './Selector.scss'

type VehicleSelectorProps = {
  disabled?: boolean
  vehicleNumber: number | undefined
  setVehicleNumber: (vehicleNumber: number) => void
}

const VehicleSelector = ({ vehicleNumber, disabled, setVehicleNumber }: VehicleSelectorProps) => {
  const [value, setValue] = useState<VehicleSelectorProps['vehicleNumber']>(vehicleNumber)
  const debouncedSetVehicleNumber = useCallback(debounce(setVehicleNumber, 200), [setVehicleNumber])
  const { t } = useTranslation()

  useLayoutEffect(() => {
    setValue(vehicleNumber)
  }, [])

  const handleClearInput = () => {
    setValue(0)
    setVehicleNumber(0)
  }

  const textFieldClass = classNames({
    'selector-vehicle-text-field': true,
    'selector-vehicle-text-field_visible': value,
    'selector-vehicle-text-field_hidden': !value,
  })
  return (
    <TextField
      fullWidth
      disabled={disabled}
      className={textFieldClass}
      label={t('choose_vehicle')}
      type="text"
      value={value && +value < 0 ? 0 : value}
      onChange={(e) => {
        const inputValue = e.target.value
        const numericValue = inputValue === '' ? undefined : parseInt(inputValue, 10) || 0
        setValue(numericValue)
        debouncedSetVehicleNumber(numericValue || 0)
      }}
      slotProps={{
        inputLabel: {
          shrink: true,
        },
        input: {
          placeholder: t('vehicle_placeholder'),
          endAdornment: <ClearButton onClearInput={handleClearInput} />,
        },
      }}
    />
  )
}

export default VehicleSelector
