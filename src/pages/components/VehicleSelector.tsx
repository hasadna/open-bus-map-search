import { TextField } from '@mui/material'
import classNames from 'classnames'
import { debounce } from 'es-toolkit/compat'
import { useCallback, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ClearButton from './ClearButton'
import './Selector.scss'

export const normalizeVehicleNumber = (inputValue: string): number | undefined => {
  const digitsOnly = inputValue.replace(/\D/g, '')
  return digitsOnly ? Number(digitsOnly) : undefined
}

type VehicleSelectorProps = {
  disabled?: boolean
  vehicleNumber: number | undefined
  setVehicleNumber: (vehicleNumber: number) => void
}

const VehicleSelector = ({ vehicleNumber, disabled, setVehicleNumber }: VehicleSelectorProps) => {
  const [value, setValue] = useState<VehicleSelectorProps['vehicleNumber']>(vehicleNumber)
  const debouncedSetVehicleNumber = useCallback(debounce(setVehicleNumber, 200), [setVehicleNumber])
  const { t } = useTranslation()

  // The field keeps its own value so typing isn't throttled by the debounced parent
  // update, but it must follow the prop when the parent changes it from elsewhere —
  // a shared link seeds `vehicle.vehicleNumber` into usePageState one tick after mount.
  useLayoutEffect(() => {
    setValue(vehicleNumber)
  }, [vehicleNumber])

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
      // '' rather than undefined for "no vehicle": the field must stay controlled for
      // its whole lifetime — a shared link fills it a tick after mount.
      value={value && +value < 0 ? 0 : (value ?? '')}
      onChange={(e) => {
        const numericValue = normalizeVehicleNumber(e.target.value)
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
