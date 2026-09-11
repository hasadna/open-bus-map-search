import { TodayTwoTone } from '@mui/icons-material'
import { Box, Button, ButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { addDays, type CivilDate, todayCivilDate } from 'src/model/time/civilDate'
import './DateNavigator.scss'

interface DateNavigatorProps {
  currentDate: CivilDate
  onChange: (date: CivilDate) => void
}

export const DateNavigator = ({ currentDate, onChange }: DateNavigatorProps) => {
  const { t } = useTranslation()

  const handleChange = (days: number) => onChange(addDays(currentDate, days))

  const handleToday = () => onChange(todayCivilDate())

  const unit = (count: number) =>
    count === 1 ? t('date_navigator_unit_day') : t('date_navigator_unit_days')

  return (
    <Box sx={{ width: '100%', my: 1 }}>
      <ButtonGroup
        variant="outlined"
        fullWidth
        sx={{
          bgcolor: 'background.paper',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          borderRadius: 2,
        }}>
        <Button
          className="nav-btn"
          onClick={() => handleChange(-7)}
          title={t('date_navigator_prev_week')}
          aria-label={t('date_navigator_prev_week')}>
          <span className="nav-btn-num" dir="ltr">
            -7
          </span>
          <span className="nav-btn-unit">{unit(7)}</span>
        </Button>
        <Button
          className="nav-btn"
          onClick={() => handleChange(-1)}
          title={t('date_navigator_prev_day')}
          aria-label={t('date_navigator_prev_day')}>
          <span className="nav-btn-num" dir="ltr">
            -1
          </span>
          <span className="nav-btn-unit">{unit(1)}</span>
        </Button>
        <Button
          className="nav-btn today"
          onClick={handleToday}
          title={t('date_navigator_today')}
          aria-label={t('date_navigator_today')}>
          <TodayTwoTone className="nav-btn-icon" />
          <span className="nav-btn-unit">{t('date_navigator_today')}</span>
        </Button>
        <Button
          className="nav-btn"
          onClick={() => handleChange(1)}
          title={t('date_navigator_next_day')}
          aria-label={t('date_navigator_next_day')}>
          <span className="nav-btn-num" dir="ltr">
            +1
          </span>
          <span className="nav-btn-unit">{unit(1)}</span>
        </Button>
        <Button
          className="nav-btn"
          onClick={() => handleChange(7)}
          title={t('date_navigator_next_week')}
          aria-label={t('date_navigator_next_week')}>
          <span className="nav-btn-num" dir="ltr">
            +7
          </span>
          <span className="nav-btn-unit">{unit(7)}</span>
        </Button>
      </ButtonGroup>
    </Box>
  )
}
