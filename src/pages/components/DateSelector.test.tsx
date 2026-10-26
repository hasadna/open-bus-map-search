import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import type { Mock } from 'vitest'
import dayjs from 'src/dayjs'
import i18n from 'src/locale/allTranslations'
import { DateSelector } from './DateSelector'

const TODAY = dayjs('2026-09-14T12:00')

type OnCommit = (date: string | null) => void

type HarnessProps = {
  initial: dayjs.Dayjs
  minDate?: dayjs.Dayjs
  onCommit: OnCommit
}

function Harness({ initial, minDate, onCommit }: HarnessProps) {
  const [time, setTime] = useState(initial)
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateSelector
        time={time}
        minDate={minDate}
        onChange={(value) => {
          onCommit(value?.format('YYYY-MM-DD') ?? null)
          if (value) setTime(value)
        }}
      />
      <button onClick={() => setTime(initial)}>reset</button>
    </LocalizationProvider>
  )
}

const renderField = (props: Partial<HarnessProps> = {}) => {
  const onCommit = vi.fn<OnCommit>()
  const view = render(<Harness initial={TODAY} onCommit={onCommit} {...props} />)
  return { onCommit, ...view }
}

const sections = () => screen.getAllByRole('spinbutton')
const shownDate = () =>
  sections()
    .map((section) => section.textContent)
    .join('/')
const committedDates = (onCommit: Mock<OnCommit>) => onCommit.mock.calls.map(([date]) => date)

const typeDigits = (digits: string) => {
  act(() => sections()[0].focus())
  for (const digit of digits) {
    fireEvent.input(document.activeElement!, { target: { textContent: digit } })
  }
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(TODAY.toDate())
})

afterEach(() => {
  vi.useRealTimers()
})

describe('DateSelector typing', () => {
  it('keeps every digit when a partially typed date lands in the future', () => {
    const { onCommit } = renderField()

    typeDigits('25082026')

    expect(shownDate()).toBe('25/08/2026')
    expect(onCommit).toHaveBeenLastCalledWith('2026-08-25')
    expect(committedDates(onCommit)).not.toContain('2026-09-25')
  })

  it('shows a future date it does not commit, and says why', () => {
    const { onCommit } = renderField()

    typeDigits('20')

    expect(shownDate()).toBe('20/09/2026')
    expect(screen.getByText(i18n.t('date_navigator_future_error'))).toBeInTheDocument()
    expect(committedDates(onCommit)).not.toContain('2026-09-20')
  })

  it('shows a date before minDate it does not commit, and says why', () => {
    const { onCommit } = renderField({
      initial: dayjs('2026-09-10T12:00'),
      minDate: dayjs('2026-09-07T12:00'),
    })

    typeDigits('05')

    expect(shownDate()).toBe('05/09/2026')
    expect(screen.getByText(i18n.t('bug_date_alert'))).toBeInTheDocument()
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('keeps an uncommitted date when the parent passes an equal but new Dayjs', () => {
    const field = (time: dayjs.Dayjs) => (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateSelector time={time} onChange={vi.fn()} />
      </LocalizationProvider>
    )
    const { rerender } = render(field(TODAY.clone()))
    typeDigits('20')

    rerender(field(TODAY.clone()))

    expect(shownDate()).toBe('20/09/2026')
  })

  it('replaces an uncommitted date when the parent changes the date', () => {
    renderField({ initial: dayjs('2026-09-01T12:00') })
    typeDigits('20')
    expect(shownDate()).toBe('20/09/2026')

    fireEvent.click(screen.getByRole('button', { name: 'reset' }))

    expect(shownDate()).toBe('01/09/2026')
  })
})
