import { TEXTS } from '../../resources/texts'
import './DisplayGapsPercentage.scss'
import { Row } from './Row'

function getStatus(percentage: number, decentPercentage: number, terriblePercentage: number) {
  const moreThanOneHundredPercent = 101
  const statuses = [
    {
      min: -Infinity,
      status: 'invalid',
    },
    {
      min: 0,
      status: 'great',
    },
    {
      min: decentPercentage,
      status: 'decent',
    },
    {
      min: terriblePercentage,
      status: 'terrible',
    },
    {
      min: moreThanOneHundredPercent,
      status: 'invalid',
    },
  ]
  return statuses.findLast((status: { min: number; status: string }) => status.min <= percentage)
    ?.status
}

function DisplayGapsPercentage({
  gapsPercentage,
  decentPercentage,
  terriblePercentage,
}: {
  gapsPercentage: number | undefined
  decentPercentage: number
  terriblePercentage: number
}) {
  if (!gapsPercentage && gapsPercentage != 0) return <></>
  const status = getStatus(gapsPercentage, decentPercentage, terriblePercentage)
  const stylesClass = `gaps-percentage-displayed-${status}-result`
  const text =
    status === 'great'
      ? TEXTS.all_rides_completed
      : `${Math.floor(gapsPercentage)}% ${TEXTS.missing_rides}`

  return (
    <Row>
      <div className={stylesClass}>{text}</div>
    </Row>
  )
}
export default DisplayGapsPercentage
