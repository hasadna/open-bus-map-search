import { Today } from '@mui/icons-material'
import { Box, Button, ButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'
import dayjs from 'src/dayjs'
import './DateNavigator.scss'

interface DateNavigatorProps {
  currentTime: dayjs.Dayjs
  onChange: (time: dayjs.Dayjs) => void
}

export const DateNavigator = ({ currentTime, onChange }: DateNavigatorProps) => {
  const { t } = useTranslation()

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
          {t('date_navigator_prev_week')}
        </Button>
        <Button onClick={() => handleChange(-1, 'day')} className="nav-btn">
          {t('date_navigator_prev_day')}
        </Button>
        <Button
          onClick={handleToday}
          className="nav-btn today"
          startIcon={<Today fontSize="small" />}>
          {t('date_navigator_today')}
        </Button>
        <Button onClick={() => handleChange(1, 'day')} className="nav-btn">
          {t('date_navigator_next_day')}
        </Button>
        <Button onClick={() => handleChange(1, 'week')} className="nav-btn">
          {t('date_navigator_next_week')}
        </Button>
      </ButtonGroup>
    </Box>
  )
}
