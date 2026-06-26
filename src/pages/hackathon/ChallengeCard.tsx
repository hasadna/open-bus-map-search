import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Challenge, ChallengeTier } from './challenges'

interface TierStyle {
  color: string
  bg: string
  border: string
  emoji: string
}

const TIER: Record<ChallengeTier, TierStyle> = {
  starter: { color: '#15803d', bg: '#f0fdf4', border: '#22c55e', emoji: '🌱' },
  intermediate: { color: '#1d4ed8', bg: '#eff6ff', border: '#3b82f6', emoji: '🔧' },
  advanced: { color: '#6d28d9', bg: '#f5f3ff', border: '#8b5cf6', emoji: '🚀' },
}

interface Props {
  challenge: Challenge
}

const ChallengeCard = ({ challenge }: Props) => {
  const { t } = useTranslation()
  const tx = t as (key: string, options?: Record<string, unknown>) => string
  const [open, setOpen] = useState(false)
  const base = `hackathonPage.challenges.${challenge.id}`
  const cfg = TIER[challenge.tier]

  const doneItems = (t as (key: string, options?: Record<string, unknown>) => unknown)(
    `${base}.done`,
    { returnObjects: true, defaultValue: [] },
  ) as string[]

  return (
    <Card $border={cfg.border}>
      <Toggle
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((v) => !v)}>
        <PillRow>
          <TierPill $color={cfg.color} $bg={cfg.bg}>
            {cfg.emoji} {tx(`hackathonPage.tier.${challenge.tier}`)}
          </TierPill>
          {challenge.domainExpertFriendly && (
            <ExpertPill>🤝 {t('hackathonPage.domainExpertBadge')}</ExpertPill>
          )}
          <TimePill>
            ⏱ {challenge.sizedMinutes} {t('hackathonPage.minutes')}
          </TimePill>
          <Chevron $open={open}>›</Chevron>
        </PillRow>
        <CardTitle>{tx(`${base}.title`)}</CardTitle>
        <OneLiner>{tx(`${base}.oneLiner`)}</OneLiner>
      </Toggle>

      <ExpandRegion $open={open}>
        <ExpandContent $open={open}>
          <ShipBox>
            <ShipMeta>🎯 {t('hackathonPage.ship')}</ShipMeta>
            <ShipText>{tx(`${base}.ship`)}</ShipText>
          </ShipBox>

          <TwoCol>
            <Col>
              <FieldLabel>📚 {t('hackathonPage.learn')}</FieldLabel>
              <FieldValue>{tx(`${base}.learn`)}</FieldValue>
            </Col>
            <Col>
              <FieldLabel>🛠 {t('hackathonPage.stack')}</FieldLabel>
              <TagRow>
                {challenge.stack.map((s) => (
                  <StackTag key={s}>{s}</StackTag>
                ))}
              </TagRow>
            </Col>
          </TwoCol>

          <Hr />

          <Section>
            <SHead>{t('hackathonPage.brief')}</SHead>
            <p>{tx(`${base}.brief`)}</p>
          </Section>

          {challenge.startingPoints.length > 0 && (
            <Section>
              <SHead>{t('hackathonPage.startingPoints')}</SHead>
              <ul>
                {challenge.startingPoints.map((sp) => (
                  <li key={sp.href}>
                    <ExtLink href={sp.href} target="_blank" rel="noopener noreferrer">
                      {tx(`hackathonPage.${sp.labelKey}`)}
                    </ExtLink>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {doneItems.length > 0 && (
            <Section>
              <SHead>{t('hackathonPage.definitionOfDone')}</SHead>
              <DoneList>
                {doneItems.map((item, i) => (
                  <DoneItem key={i}>
                    {/* eslint-disable-next-line i18next/no-literal-string -- decorative glyph */}
                    <Check>✓</Check>
                    <span>{item}</span>
                  </DoneItem>
                ))}
              </DoneList>
            </Section>
          )}

          <NextBox>
            <NextMeta>→ {t('hackathonPage.nextSteps')}</NextMeta>
            <p>{tx(`${base}.nextSteps`)}</p>
          </NextBox>
        </ExpandContent>
      </ExpandRegion>
    </Card>
  )
}

const Card = styled.div<{ $border: string }>`
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  border-inline-start: 4px solid ${({ $border }) => $border};
  margin-bottom: 8px;
  overflow: hidden;
  transition: box-shadow 0.18s ease;

  &:hover {
    box-shadow: 0 2px 14px rgba(0, 0, 0, 0.07);
  }

  .dark & {
    background: #1b1d21;
    border-color: rgba(255, 255, 255, 0.1);
    border-inline-start-color: ${({ $border }) => $border};
  }

  .dark &:hover {
    box-shadow: 0 2px 14px rgba(0, 0, 0, 0.5);
  }
`

const Toggle = styled.div`
  padding: 14px 16px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  user-select: none;

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
    border-radius: 8px;
  }
`

const PillRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`

const PillBase = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
`

const TierPill = styled(PillBase)<{ $color: string; $bg: string }>`
  color: ${({ $color }) => $color};
  background: ${({ $bg }) => $bg};
`

const ExpertPill = styled(PillBase)`
  color: #92400e;
  background: #fef9c3;
  border: 1px solid #fde047;
`

const TimePill = styled(PillBase)`
  color: #6b7280;
  background: #f3f4f6;
  font-weight: 500;
  margin-inline-start: auto;

  .dark & {
    color: #cbd5e1;
    background: rgba(255, 255, 255, 0.08);
  }
`

const Chevron = styled.span<{ $open: boolean }>`
  font-size: 18px;
  line-height: 1;
  color: #9ca3af;
  transition: transform 0.22s ease;
  transform: rotate(${({ $open }) => ($open ? '90deg' : '0deg')});
  display: inline-flex;
`

const CardTitle = styled.div`
  font-size: 15.5px;
  font-weight: 650;
  color: #111827;
  line-height: 1.4;
  overflow-wrap: break-word;

  .dark & {
    color: #f1f5f9;
  }
`

const OneLiner = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  overflow-wrap: break-word;

  .dark & {
    color: #94a3b8;
  }
`

const ExpandRegion = styled.div<{ $open: boolean }>`
  display: grid;
  grid-template-rows: ${({ $open }) => ($open ? '1fr' : '0fr')};
  transition: grid-template-rows 0.28s ease;
`

const ExpandContent = styled.div<{ $open: boolean }>`
  overflow: hidden;
  min-height: 0;
  padding: 0 16px;
  padding-bottom: ${({ $open }) => ($open ? '16px' : '0')};
  transition: padding-bottom 0.28s ease;

  p {
    font-size: 14px;
    line-height: 1.7;
    color: #374151;
    margin: 6px 0 0;
    overflow-wrap: break-word;
  }

  ul {
    margin: 6px 0 0;
    padding-inline-start: 20px;
    font-size: 13.5px;
    line-height: 1.65;
    color: #374151;
    overflow-wrap: break-word;
  }

  .dark & p,
  .dark & ul {
    color: #cbd5e1;
  }
`

const ShipBox = styled.div`
  background: #eff6ff;
  border-radius: 8px;
  padding: 10px 13px;
  margin-bottom: 12px;
  border-inline-start: 3px solid #3b82f6;

  .dark & {
    background: rgba(59, 130, 246, 0.12);
  }
`

const ShipMeta = styled.div`
  font-size: 10.5px;
  font-weight: 700;
  color: #1d4ed8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;

  .dark & {
    color: #93c5fd;
  }
`

const ShipText = styled.div`
  font-size: 13.5px;
  line-height: 1.55;
  color: #1e40af;

  .dark & {
    color: #bfdbfe;
  }
`

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`

const Col = styled.div``

const FieldLabel = styled.div`
  font-size: 10.5px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 5px;
`

const FieldValue = styled.div`
  font-size: 13.5px;
  line-height: 1.5;
  color: #374151;

  .dark & {
    color: #cbd5e1;
  }
`

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`

const StackTag = styled.span`
  font-size: 11px;
  padding: 2px 7px;
  background: #f3f4f6;
  border-radius: 5px;
  color: #374151;
  font-weight: 500;

  .dark & {
    background: rgba(255, 255, 255, 0.08);
    color: #cbd5e1;
  }
`

const Hr = styled.hr`
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 0 0 12px;

  .dark & {
    border-top-color: rgba(255, 255, 255, 0.1);
  }
`

const Section = styled.div`
  margin-bottom: 12px;
`

const SHead = styled.div`
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
  margin-bottom: 2px;
`

const ExtLink = styled.a`
  color: #2563eb;
  text-decoration: none;
  font-size: 13.5px;
  overflow-wrap: break-word;
  word-break: break-word;

  &:hover {
    text-decoration: underline;
  }

  .dark & {
    color: #69b1ff;
  }
`

const DoneList = styled.ul`
  list-style: none !important;
  padding: 0 !important;
  margin: 6px 0 0 !important;
`

const DoneItem = styled.li`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 13.5px;
  color: #374151;
  line-height: 1.55;
  margin-bottom: 4px;

  .dark & {
    color: #cbd5e1;
  }
`

const Check = styled.span`
  color: #16a34a;
  font-weight: 700;
  flex-shrink: 0;
`

const NextBox = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 10px 13px;

  p {
    color: #6b7280;
    font-size: 13px;
  }

  .dark & {
    background: rgba(255, 255, 255, 0.04);
  }

  .dark & p {
    color: #94a3b8;
  }
`

const NextMeta = styled.div`
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #9ca3af;
  margin-bottom: 3px;
`

export default ChallengeCard
