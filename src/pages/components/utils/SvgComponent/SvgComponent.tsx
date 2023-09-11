import React from 'react'
import busIcon from '../../../../resources/bus-front.svg'

async function getSvgFromOperatorId(operator_id: number | string) {
  let icon = busIcon
  try {
    icon = (await import(
      `../../../../resources/bus-logos/${operator_id.toString()}.svg`
    )) as React.FunctionComponent<React.SVGAttributes<SVGElement>>
  } catch (err) {
    icon = busIcon
  }
  return icon
}
export default getSvgFromOperatorId
