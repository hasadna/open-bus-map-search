import { Today } from '@mui/icons-material'
import { Box, Button, ButtonGroup } from '@mui/material'
import dayjs from 'src/dayjs'
import './DateNavigator.scss'

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

  const handleToday = () => onChange(dayjs())

  return (
    <Box sx={{ width: { xs: '100%', sm: '100%' }, my: 1 }}>
      <ButtonGroup
        variant="outlined"
        fullWidth
        sx={{
          bgcolor: 'background.paper',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          borderRadius: 2,
        }}>
        <Button onClick={() => handleChange(-1, 'week')} className="nav-btn">
          שבוע קודם
        </Button>
        <Button onClick={() => handleChange(-1, 'day')} className="nav-btn">
          יום קודם
        </Button>
        <Button
          onClick={handleToday}
          className="nav-btn today"
          startIcon={<Today fontSize="small" />}>
          היום
        </Button>
        <Button onClick={() => handleChange(1, 'day')} className="nav-btn">
          יום הבא
        </Button>
        <Button onClick={() => handleChange(1, 'week')} className="nav-btn">
          שבוע הבא
        </Button>
      </ButtonGroup>
    </Box>
  )
}
