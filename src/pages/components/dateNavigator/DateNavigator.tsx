import { Box, Button, ButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'
import dayjs from 'src/dayjs'
import './DateNavigator.scss'

interface DateNavigatorProps {
  currentTime: dayjs.Dayjs
  onChange: (time: dayjs.Dayjs) => void
}

// Render each word of a label on its own line so every multi-word button is
// laid out identically — always two lines for the navigation buttons (e.g.
// "Previous" / "week") in every language. This keeps all buttons the same
// shape (no mix of 1- and 2-line buttons within the group) instead of relying
// on width-dependent wrapping. The single-word Today label stays on one line
// and is vertically centered by the equal-height ButtonGroup.
const stackedLabel = (label: string) =>
  label
    .trim()
    .split(/\s+/)
    .map((word, i) => <span key={i}>{word}</span>)

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
          {stackedLabel(t('date_navigator_prev_week'))}
        </Button>
        <Button onClick={() => handleChange(-1, 'day')} className="nav-btn">
          {stackedLabel(t('date_navigator_prev_day'))}
        </Button>
        <Button onClick={handleToday} className="nav-btn today">
          {stackedLabel(t('date_navigator_today'))}
        </Button>
        <Button onClick={() => handleChange(1, 'day')} className="nav-btn">
          {stackedLabel(t('date_navigator_next_day'))}
        </Button>
        <Button onClick={() => handleChange(1, 'week')} className="nav-btn">
          {stackedLabel(t('date_navigator_next_week'))}
        </Button>
      </ButtonGroup>
    </Box>
  )
}
