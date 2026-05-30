import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export interface Persona {
  id: string
  emoji: string
}

export const PERSONAS: Persona[] = [
  { id: 'developer', emoji: '👩‍💻' },
  { id: 'government', emoji: '🏛️' },
  { id: 'operator', emoji: '🚌' },
  { id: 'npo', emoji: '🤝' },
]

interface Props {
  persona: Persona
}

const PersonaCard = ({ persona }: Props) => {
  const { t } = useTranslation()
  const tx = t as (key: string) => string
  const base = `hackathonPage.personas.${persona.id}`
  return (
    <Card>
      <Emoji aria-hidden>{persona.emoji}</Emoji>
      <Name>{tx(`${base}.name`)}</Name>
      <Invite>{tx(`${base}.invite`)}</Invite>
    </Card>
  )
}

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: var(--card-bg, #fff);
  height: 100%;
`

const Emoji = styled.span`
  font-size: 32px;
  line-height: 1;
`

const Name = styled.span`
  font-size: 16px;
  font-weight: 600;
`

const Invite = styled.span`
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.85;
`

export default PersonaCard
