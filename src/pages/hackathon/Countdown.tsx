import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { keyframes } from 'styled-components'
import { POSTPONED } from './challenges'

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

// ─── Glitch unit logic ────────────────────────────────────────────────────

type AnimType = 'roll' | 'shake' | 'flip'

const GLITCH_CHARS = '0123456789?!#%@*'
const FLIPS = ['none', 'rotate(180deg)', 'scaleX(-1)', 'scaleY(-1)']

const randomChar = () => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
const randomFlip = () => FLIPS[Math.floor(Math.random() * FLIPS.length)]
const randomAnim = (): AnimType =>
  (['roll', 'shake', 'flip'] as AnimType[])[Math.floor(Math.random() * 3)]

// Resting char: often a random digit 0-6, otherwise a '?'
const randomRestChar = () => (Math.random() < 0.65 ? String(Math.floor(Math.random() * 7)) : '?')

interface GlitchChar {
  char: string
  flip: string
}

interface GlitchState {
  chars: GlitchChar[]
  animKey: number
  animType: AnimType
}

const restState = (): GlitchChar[] => [
  { char: randomRestChar(), flip: randomFlip() },
  { char: randomRestChar(), flip: randomFlip() },
]

function useGlitchUnit(): GlitchState {
  const [state, setState] = useState<GlitchState>({
    chars: restState(),
    animKey: 0,
    animType: 'shake',
  })

  useEffect(() => {
    let glitchTimer: number
    let burstTimer: number

    const startBurst = () => {
      let count = 0
      burstTimer = window.setInterval(() => {
        setState((prev) => ({
          chars: [
            { char: randomChar(), flip: randomFlip() },
            { char: randomChar(), flip: randomFlip() },
          ],
          animKey: prev.animKey + 1,
          animType: randomAnim(),
        }))
        count++
        if (count >= 5) {
          window.clearInterval(burstTimer)
          setState((prev) => ({ ...prev, chars: restState() }))
          scheduleNext()
        }
      }, 110)
    }

    const scheduleNext = () => {
      glitchTimer = window.setTimeout(startBurst, 3000 + Math.random() * 6000)
    }

    scheduleNext()

    return () => {
      window.clearTimeout(glitchTimer)
      window.clearInterval(burstTimer)
    }
  }, [])

  return state
}

const GlitchUnit = ({ label }: { label: string }) => {
  const { chars, animKey, animType } = useGlitchUnit()
  return (
    <Unit>
      <GlitchValue key={animKey} data-anim={animType}>
        {chars.map((c, i) => (
          <GlitchChar key={i} style={{ transform: c.flip }}>
            {c.char}
          </GlitchChar>
        ))}
      </GlitchValue>
      <Label>{label}</Label>
    </Unit>
  )
}

const PostponedCountdown = ({ variant = 'large' }: { variant?: 'large' | 'compact' }) => {
  const { t } = useTranslation()
  return (
    <PostponedWrapper $variant={variant}>
      <DigitRow $variant={variant}>
        <GlitchUnit label="DD" />
        <Sep>:</Sep>
        <GlitchUnit label="HH" />
        <Sep>:</Sep>
        <GlitchUnit label="MM" />
        <Sep>:</Sep>
        <GlitchUnit label="SS" />
      </DigitRow>
      <PostponedNote>{t('hackathonPage.countdown.postponedNote')}</PostponedNote>
    </PostponedWrapper>
  )
}

const Countdown = ({ targetIso, variant = 'large' }: CountdownProps) => {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(targetIso))

  useEffect(() => {
    const tick = () => setTimeLeft(computeTimeLeft(targetIso))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [targetIso])

  if (POSTPONED) {
    return <PostponedCountdown variant={variant} />
  }

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

// ─── Animations ────────────────────────────────────────────────────────────

const rollIn = keyframes`
  from { transform: translateY(110%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`

const shake = keyframes`
  0%   { transform: translateX(0);    text-shadow: none; }
  20%  { transform: translateX(-4px); text-shadow: -2px 0 #facc15, 2px 0 #fde68a; }
  40%  { transform: translateX(3px);  text-shadow:  2px 0 #facc15, -2px 0 #fde68a; }
  60%  { transform: translateX(-3px); text-shadow: -3px 0 #facc15, 3px 0 #fde68a; }
  80%  { transform: translateX(2px);  text-shadow: none; }
  100% { transform: translateX(0);    text-shadow: none; }
`

const flip = keyframes`
  0%   { transform: rotateX(0deg);   opacity: 1; }
  45%  { transform: rotateX(90deg);  opacity: 0.2; }
  55%  { transform: rotateX(-90deg); opacity: 0.2; }
  100% { transform: rotateX(0deg);   opacity: 1; }
`

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

const PostponedWrapper = styled.div<{ $variant: 'large' | 'compact' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`

const DigitRow = styled.div<{ $variant: 'large' | 'compact' }>`
  display: flex;
  align-items: center;
  gap: ${({ $variant }) => ($variant === 'large' ? '12px' : '6px')};
  font-variant-numeric: tabular-nums;
  direction: ltr;
  flex-wrap: wrap;
  justify-content: center;
`

const GlitchValue = styled.span`
  font-size: clamp(28px, 6vw, 48px);
  font-weight: 700;
  line-height: 1;
  display: inline-flex;
  overflow: hidden;
  perspective: 400px;

  &[data-anim='roll'] {
    animation: ${rollIn} 200ms ease-out both;
  }

  &[data-anim='shake'] {
    animation: ${shake} 180ms ease-in-out both;
    color: #ca8a04;
  }

  &[data-anim='flip'] {
    animation: ${flip} 320ms ease-in-out both;
  }
`

const GlitchChar = styled.span`
  display: inline-block;
`

const PostponedNote = styled.span`
  font-size: 11px;
  opacity: 0.5;
  letter-spacing: 0.03em;
`

export { computeTimeLeft, PostponedCountdown }
export default Countdown
