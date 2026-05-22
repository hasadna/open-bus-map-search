import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import Widget from 'src/shared/Widget'
import ChallengeCard from './ChallengeCard'
import { CHALLENGES, ChallengeTier, REGISTRATION_CLOSE_ISO, Track } from './challenges'
import Countdown from './Countdown'
import PersonaCard, { PERSONAS } from './PersonaCard'
import RegistrationEmbed from './RegistrationEmbed'
import './Hackathon.scss'

const TRACKS: Track[] = ['harness', 'ai-readiness', 'mapping', 'data']
const TIERS: (ChallengeTier | 'all')[] = ['all', 'starter', 'intermediate', 'advanced']

const TIER_EMOJI: Record<ChallengeTier, string> = {
  starter: '🌱',
  intermediate: '🔧',
  advanced: '🚀',
}

const TRACK_ACCENT: Record<Track, string> = {
  harness: '#1e293b',
  'ai-readiness': '#0f766e',
  mapping: '#92400e',
  data: '#1e3a5f',
}

const MENTORS = [
  { id: 'noam', nameHe: 'נועם', nameEn: 'Noam', emoji: '🧭' },
  { id: 'aviv', nameHe: 'אביב', nameEn: 'Aviv', emoji: '⚡' },
  { id: 'uri', nameHe: 'אורי', nameEn: 'Uri', emoji: '🏗️' },
  { id: 'dorit', nameHe: 'דורית', nameEn: 'Dorit', emoji: '🎯' },
  { id: 'imri', nameHe: 'אימרי', nameEn: 'Imri', emoji: '✨' },
] as const

const Hackathon = () => {
  const { t, i18n } = useTranslation()
  const tx = t as (key: string, opts?: Record<string, unknown>) => string
  const [tierFilter, setTierFilter] = useState<ChallengeTier | 'all'>('all')

  const challengesByTrack = useMemo(() => {
    const filtered = CHALLENGES.filter((c) => tierFilter === 'all' || c.tier === tierFilter)
    return TRACKS.map((track) => ({
      track,
      items: filtered.filter((c) => c.track === track),
    }))
  }, [tierFilter])

  const challengeCountByTrack = useMemo(
    () =>
      Object.fromEntries(
        TRACKS.map((track) => [track, CHALLENGES.filter((c) => c.track === track).length]),
      ) as Record<Track, number>,
    [],
  )

  const whyComeKeys = ['contribute', 'learn', 'sunkCost']
  const scheduleKeys = ['mingling', 'talks', 'groupWork', 'demos', 'cleanup']
  const faqKeys = ['bring', 'experience', 'free', 'regulator', 'devenv']

  return (
    <Page>
      <Hero>
        <Title>{t('hackathonPage.hero.title')}</Title>
        <Subtitle>{t('hackathonPage.hero.subtitle')}</Subtitle>
        <Audience>{t('hackathonPage.hero.audience')}</Audience>
        <Meta>
          <span>📅 {t('hackathonPage.hero.date')}</span>
          <span>📍 {t('hackathonPage.hero.location')}</span>
          <span>🤝 {t('hackathonPage.hero.partner')}</span>
        </Meta>
        <CtaLink href="#register">{t('hackathonPage.hero.cta')}</CtaLink>
        <CountdownStrip>
          <span>{t('hackathonPage.hero.countdownLabel')}</span>
          <Countdown targetIso={REGISTRATION_CLOSE_ISO} variant="compact" />
        </CountdownStrip>
      </Hero>

      <Widget title={t('hackathonPage.personas.title')}>
        <p>{t('hackathonPage.personas.intro')}</p>
        <PersonaGrid>
          {PERSONAS.map((p) => (
            <PersonaCard key={p.id} persona={p} />
          ))}
        </PersonaGrid>
      </Widget>

      <Widget title={t('hackathonPage.whyCome.title')}>
        <WhyComeGrid>
          {whyComeKeys.map((k) => (
            <WhyCard key={k}>
              <h3>{tx(`hackathonPage.whyCome.${k}.title`)}</h3>
              <p>{tx(`hackathonPage.whyCome.${k}.body`)}</p>
            </WhyCard>
          ))}
        </WhyComeGrid>
      </Widget>

      <Widget title={t('hackathonPage.paths.title')}>
        <p>{t('hackathonPage.paths.intro')}</p>
        <PathGrid>
          {TRACKS.map((track) => (
            <PathCard key={track} $accent={TRACK_ACCENT[track]} href={`#track-${track}`}>
              <PathCardName>{tx(`hackathonPage.track.${track}`)}</PathCardName>
              <PathCardDesc>{tx(`hackathonPage.trackDescription.${track}`)}</PathCardDesc>
              <PathCardFooter>
                <PathAudienceBadge>{tx(`hackathonPage.trackAudience.${track}`)}</PathAudienceBadge>
                <PathCount>
                  {tx('hackathonPage.paths.challengeCount', {
                    count: challengeCountByTrack[track],
                  })}
                </PathCount>
              </PathCardFooter>
              <PathCardCta>{t('hackathonPage.paths.goToChallenges')}</PathCardCta>
            </PathCard>
          ))}
        </PathGrid>
      </Widget>

      <Widget title={t('hackathonPage.schedule.title')}>
        <ScheduleList>
          {scheduleKeys.map((k) => (
            <li key={k}>
              <Time>{tx(`hackathonPage.schedule.${k}.time`)}</Time>
              <span>{tx(`hackathonPage.schedule.${k}.label`)}</span>
            </li>
          ))}
        </ScheduleList>
      </Widget>

      <Widget title={t('hackathonPage.challenges.title')}>
        <p>{t('hackathonPage.challenges.intro')}</p>
        <Filters>
          {TIERS.map((tier) => (
            <FilterChip
              key={tier}
              $active={tierFilter === tier}
              onClick={() => setTierFilter(tier)}>
              {tier === 'all'
                ? t('hackathonPage.tier.all')
                : `${TIER_EMOJI[tier]} ${tx(`hackathonPage.tier.${tier}`)}`}
            </FilterChip>
          ))}
        </Filters>
        {challengesByTrack.map(({ track, items }) => (
          <TrackBlock key={track} $accent={TRACK_ACCENT[track]}>
            <TrackHeader id={`track-${track}`} $accent={TRACK_ACCENT[track]}>
              <h3>{tx(`hackathonPage.track.${track}`)}</h3>
              <p className="track-description">{tx(`hackathonPage.trackDescription.${track}`)}</p>
            </TrackHeader>
            {items.length === 0 ? (
              <EmptyTrack>{t('hackathonPage.noChallengesForFilter')}</EmptyTrack>
            ) : (
              items.map((c) => <ChallengeCard key={c.id} challenge={c} />)
            )}
          </TrackBlock>
        ))}
        <NonDevBlock>
          <h3>🤝 {t('hackathonPage.nonDev.title')}</h3>
          <p>{t('hackathonPage.nonDev.body')}</p>
        </NonDevBlock>
      </Widget>

      <Widget title={t('hackathonPage.mentors.title')}>
        <p>{t('hackathonPage.mentors.body')}</p>
        <MentorGrid>
          {MENTORS.map((m) => (
            <MentorCard key={m.id}>
              <MentorEmoji>{m.emoji}</MentorEmoji>
              <MentorName>{i18n.language === 'en' ? m.nameEn : m.nameHe}</MentorName>
              <MentorRole>{tx(`hackathonPage.mentors.roles.${m.id}`)}</MentorRole>
            </MentorCard>
          ))}
        </MentorGrid>
      </Widget>

      <Widget title={t('hackathonPage.sponsors.title')}>
        <SponsorBlock>
          <SponsorLogo>🧿 Applitools</SponsorLogo>
          <p>{t('hackathonPage.sponsors.applitools')}</p>
        </SponsorBlock>
        <SponsorCallout>
          <p>{t('hackathonPage.sponsors.callout')}</p>
          <SponsorLinks>
            <a href="/donate">{t('hackathonPage.sponsors.donate')}</a>
            <a href="mailto:noam.gaash@gmail.com">{t('hackathonPage.sponsors.contact')}</a>
          </SponsorLinks>
        </SponsorCallout>
      </Widget>

      <Widget title={t('hackathonPage.registration.title')}>
        <div id="register" />
        <p>{t('hackathonPage.registration.body')}</p>
        <CountdownStrip>
          <span>{t('hackathonPage.hero.countdownLabel')}</span>
          <Countdown targetIso={REGISTRATION_CLOSE_ISO} variant="compact" />
        </CountdownStrip>
        <RegistrationEmbed />
      </Widget>

      <Widget title={t('hackathonPage.faq.title')}>
        <dl>
          {faqKeys.map((k) => (
            <FaqItem key={k}>
              <dt>{tx(`hackathonPage.faq.${k}.q`)}</dt>
              <dd>{tx(`hackathonPage.faq.${k}.a`)}</dd>
            </FaqItem>
          ))}
        </dl>
      </Widget>
    </Page>
  )
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px 32px;
  max-width: 980px;
  margin: 0 auto;
`

const Hero = styled.section`
  text-align: center;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

const Title = styled.h1`
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 700;
  margin: 0;
`

const Subtitle = styled.p`
  font-size: clamp(16px, 2.4vw, 20px);
  margin: 0;
  max-width: 640px;
`

const Audience = styled.p`
  font-size: 14px;
  opacity: 0.75;
  margin: 0;
  max-width: 640px;
`

const Meta = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 14px;
  opacity: 0.85;
`

const CountdownStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  opacity: 0.65;
  margin-top: 4px;
  flex-wrap: wrap;
  justify-content: center;
`

const CtaLink = styled.a`
  display: inline-block;
  padding: 12px 24px;
  background: #1677ff;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  margin-top: 8px;

  &:hover {
    background: #4096ff;
  }
`

const PersonaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 12px;
`

const WhyComeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
`

const WhyCard = styled.div`
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 6px;
  }
  p {
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }
`

const PathGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 14px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

const PathCard = styled.a<{ $accent: string }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 10px;
  border: 1.5px solid ${({ $accent }) => $accent}33;
  border-top: 4px solid ${({ $accent }) => $accent};
  background: ${({ $accent }) => $accent}08;
  text-decoration: none;
  color: inherit;
  transition:
    box-shadow 0.18s ease,
    background 0.18s ease;

  &:hover {
    box-shadow: 0 4px 18px ${({ $accent }) => $accent}22;
    background: ${({ $accent }) => $accent}12;
    color: inherit;
  }
`

const PathCardName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
`

const PathCardDesc = styled.div`
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  flex: 1;
`

const PathCardFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
`

const PathAudienceBadge = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  color: #374151;
  font-weight: 500;
`

const PathCount = styled.span`
  font-size: 11px;
  color: #9ca3af;
  margin-inline-start: auto;
`

const PathCardCta = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-top: 2px;
`

const ScheduleList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    display: flex;
    gap: 12px;
    align-items: baseline;
    font-size: 14px;
  }
`

const Time = styled.span`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  min-width: 110px;
  direction: ltr;
`

const Filters = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 12px 0;
`

const FilterChip = styled.button<{ $active: boolean }>`
  cursor: pointer;
  user-select: none;
  padding: 5px 14px;
  font-size: 13px;
  border-radius: 999px;
  border: 1.5px solid ${({ $active }) => ($active ? '#1677ff' : '#e5e7eb')};
  background: ${({ $active }) => ($active ? '#e6f4ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#1677ff' : '#6b7280')};
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  transition:
    border-color 0.15s,
    background 0.15s,
    color 0.15s;

  &:hover {
    border-color: #1677ff;
    color: #1677ff;
  }
`

const TrackBlock = styled.div<{ $accent: string }>`
  margin-top: 24px;
`

const TrackHeader = styled.div<{ $accent: string }>`
  padding: 10px 14px;
  border-radius: 8px;
  background: ${({ $accent }) => $accent}12;
  border-inline-start: 4px solid ${({ $accent }) => $accent};
  margin-bottom: 14px;

  h3 {
    font-size: 17px;
    font-weight: 700;
    margin: 0;
    color: ${({ $accent }) => $accent};
  }

  .track-description {
    font-size: 13.5px;
    color: #6b7280;
    line-height: 1.6;
    margin: 6px 0 0;
  }
`

const EmptyTrack = styled.p`
  font-size: 13px;
  opacity: 0.5;
  font-style: italic;
`

const MentorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`

const MentorCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.025);
  border: 1px solid rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: box-shadow 0.18s ease;

  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
  }
`

const MentorEmoji = styled.div`
  font-size: 28px;
  line-height: 1;
`

const MentorName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
`

const MentorRole = styled.div`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  text-align: center;
`

const NonDevBlock = styled.div`
  margin-top: 24px;
  padding: 16px;
  border-radius: 8px;
  background: rgba(255, 215, 0, 0.08);
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 6px;
  }
  p {
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }
`

const FaqItem = styled.div`
  margin-bottom: 12px;
  dt {
    font-weight: 600;
    margin-bottom: 4px;
  }
  dd {
    margin: 0;
    opacity: 0.85;
    line-height: 1.6;
  }
`

const SponsorBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  background: #f0f9ff;
  margin-bottom: 16px;

  p {
    margin: 0;
    line-height: 1.6;
    font-size: 15px;
  }

  .dark & {
    background: #0c2340;
  }
`

const SponsorLogo = styled.div`
  font-size: 18px;
  font-weight: 700;
`

const SponsorCallout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px dashed #c0cad4;

  p {
    margin: 0;
    line-height: 1.6;
    font-size: 15px;
  }
`

const SponsorLinks = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  a {
    font-weight: 600;
    font-size: 14px;
    color: #1677ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

export default Hackathon
