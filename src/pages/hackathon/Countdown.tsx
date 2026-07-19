import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface CountdownProps {
  targetIso: string
  variant?: 'large' | 'compact'
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isClosed: boolean
}

const computeTimeLeft = (targetIso: string, now: number = Date.now()): TimeLeft => {
  const diff = new Date(targetIso).getTime() - now
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isClosed: true }
  }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isClosed: false,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

const Countdown = ({ targetIso, variant = 'large' }: CountdownProps) => {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(targetIso))

  useEffect(() => {
    const tick = () => setTimeLeft(computeTimeLeft(targetIso))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [targetIso])

  if (timeLeft.isClosed) {
    return (
      <ClosedState data-testid="countdown-closed">
        {t('hackathonPage.registrationClosed')}
      </ClosedState>
    )
  }

  return (
    <Wrapper $variant={variant} data-testid="countdown-open">
      <Unit>
        <Value>{pad(timeLeft.days)}</Value>
        <Label>{t('hackathonPage.countdown.days')}</Label>
      </Unit>
      <Sep>:</Sep>
      <Unit>
        <Value>{pad(timeLeft.hours)}</Value>
        <Label>{t('hackathonPage.countdown.hours')}</Label>
      </Unit>
      <Sep>:</Sep>
      <Unit>
        <Value>{pad(timeLeft.minutes)}</Value>
        <Label>{t('hackathonPage.countdown.minutes')}</Label>
      </Unit>
      <Sep>:</Sep>
      <Unit>
        <Value>{pad(timeLeft.seconds)}</Value>
        <Label>{t('hackathonPage.countdown.seconds')}</Label>
      </Unit>
    </Wrapper>
  )
}

// ─── Styled components ─────────────────────────────────────────────────────

const Wrapper = styled.div<{ $variant: 'large' | 'compact' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ $variant }) => ($variant === 'large' ? '12px' : '6px')};
  font-variant-numeric: tabular-nums;
  direction: ltr;
  flex-wrap: wrap;
`

const Unit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 56px;
`

const Value = styled.span`
  font-size: clamp(28px, 6vw, 48px);
  font-weight: 700;
  line-height: 1;
`

const Label = styled.span`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.7;
  margin-top: 4px;
`

const Sep = styled.span`
  font-size: clamp(28px, 6vw, 48px);
  font-weight: 700;
  line-height: 1;
  opacity: 0.4;
`

const ClosedState = styled.div`
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 600;
  text-align: center;
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
`

export { computeTimeLeft }
export default Countdown
