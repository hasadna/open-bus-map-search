import { ArrowBack, ArrowForward } from '@mui/icons-material'
import { Button, ButtonGroup } from '@mui/material'
import dayjs from 'src/dayjs'

interface DateNavigatorProps {
  currentTime: dayjs.Dayjs
  onChange: (time: dayjs.Dayjs) => void
}

export const DateNavigator = ({ currentTime, onChange }: DateNavigatorProps) => {
  const handleChange = (amount: number, unit: 'day' | 'week') => {
    const newTime =
      amount > 0 ? currentTime.add(amount, unit) : currentTime.subtract(Math.abs(amount), unit)
    onChange(newTime)
  }

  return (
    <ButtonGroup variant="outlined" size="small" sx={{ height: 40 }}>
      <Button onClick={() => handleChange(-1, 'week')} startIcon={<ArrowBack />}>
        שבוע קודם
      </Button>
      <Button onClick={() => handleChange(-1, 'day')} startIcon={<ArrowBack />}>
        יום קודם
      </Button>
      <Button onClick={() => handleChange(1, 'day')} endIcon={<ArrowForward />}>
        יום הבא
      </Button>
      <Button onClick={() => handleChange(1, 'week')} endIcon={<ArrowForward />}>
        שבוע הבא
      </Button>
    </ButtonGroup>
  )
}
