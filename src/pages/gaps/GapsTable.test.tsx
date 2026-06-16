import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { Gap } from 'src/api/gapsService'
import dayjs from 'src/dayjs'
import GapsTable from './GapsTable'

// onlyGapped keeps only rides that are truly missing: no actualStartTime AND a
// planned time in the past. So a past-planned ride survives the filter while a
// future-planned ride is dropped. Neither has an actualStartTime, so no
// completed-ride <Link> is rendered and the table needs no router.
const pastMissing = dayjs().startOf('day').subtract(1, 'day').hour(14)
const futurePlanned = dayjs().startOf('day').add(1, 'day').hour(10)
const DATE = pastMissing.format('YYYY-MM-DD')

const gaps: Gap[] = [
  { plannedStartTime: pastMissing, actualStartTime: undefined },
  { plannedStartTime: futurePlanned, actualStartTime: undefined },
]

const renderTable = (props: Partial<React.ComponentProps<typeof GapsTable>> = {}) =>
  render(
    <GapsTable
      gaps={gaps}
      date={DATE}
      singleLineMapBaseHref="/single-line-map?date=2024-01-01"
      {...props}
    />,
  )

describe('GapsTable — uncontrolled onlyGapped (Storybook / standalone)', () => {
  it('shows all rides by default and leaves the toggle off', () => {
    renderTable()
    expect(screen.getByText('14:00')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('honors initOnlyGapped by filtering to missing rides only', () => {
    renderTable({ initOnlyGapped: true })
    expect(screen.getByText('14:00')).toBeInTheDocument()
    expect(screen.queryByText('10:00')).not.toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('toggling the switch updates its own state and filters the rows', () => {
    renderTable()
    fireEvent.click(screen.getByRole('switch'))
    expect(screen.getByRole('switch')).toBeChecked()
    expect(screen.getByText('14:00')).toBeInTheDocument()
    expect(screen.queryByText('10:00')).not.toBeInTheDocument()
  })
})

describe('GapsTable — controlled onlyGapped (driven by the gaps page)', () => {
  it('reflects the onlyGapped prop without managing its own state', () => {
    renderTable({ onlyGapped: true, setOnlyGapped: jest.fn() })
    expect(screen.getByRole('switch')).toBeChecked()
    expect(screen.getByText('14:00')).toBeInTheDocument()
    expect(screen.queryByText('10:00')).not.toBeInTheDocument()
  })

  it('shows everything when the controlled value is false', () => {
    renderTable({ onlyGapped: false, setOnlyGapped: jest.fn() })
    expect(screen.getByText('14:00')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls setOnlyGapped on toggle and stays put until the parent updates the prop', () => {
    const setOnlyGapped = jest.fn()
    renderTable({ onlyGapped: false, setOnlyGapped })

    fireEvent.click(screen.getByRole('switch'))

    expect(setOnlyGapped).toHaveBeenCalledWith(true)
    // Controlled: the prop is still false, so the view must not change on its own.
    expect(screen.getByRole('switch')).not.toBeChecked()
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })
})
