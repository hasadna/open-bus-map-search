import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import VehicleSelector, { normalizeVehicleNumber } from './VehicleSelector'

describe('normalizeVehicleNumber', () => {
  it.each([
    ['12-345-67', 1234567],
    ['123-45-678', 12345678],
    ['797:93-502', 79793502],
    ['123:12:123', 12312123],
    ['12:123:12', 1212312],
    ['', undefined],
  ])('normalizes %s to %s', (inputValue, expectedValue) => {
    expect(normalizeVehicleNumber(inputValue)).toBe(expectedValue)
  })
})

describe('VehicleSelector', () => {
  it('strips hyphens and colons from pasted vehicle numbers', async () => {
    const setVehicleNumber = jest.fn()

    render(<VehicleSelector vehicleNumber={undefined} setVehicleNumber={setVehicleNumber} />)

    fireEvent.change(screen.getByLabelText('Vehicle number'), {
      target: { value: '797:93-502' },
    })

    expect(screen.getByLabelText('Vehicle number')).toHaveValue('79793502')
    await waitFor(() => expect(setVehicleNumber).toHaveBeenCalledWith(79793502))
  })
})
