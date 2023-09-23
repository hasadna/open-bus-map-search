import React from 'react'

import { TEXTS } from '../../resources/texts'
import './DisplayGapsPercentage.scss'

function DisplayGapsPercentage(gapsPrecentage: number | undefined) {
  if (!gapsPrecentage && gapsPrecentage != 0) return
  let status = ''
  switch (true) {
    case gapsPrecentage === 0:
      status = 'great'
      break
    case gapsPrecentage < 20:
      status = 'average'
      break
    case gapsPrecentage >= 20:
      status = 'terrible'
      break
  }
  const stylesClass = `gaps-percentage-displayed-${status}-result`
  const text =
    status === 'great'
      ? TEXTS.all_rides_completed
      : `${Math.floor(gapsPrecentage)}% ${TEXTS.missing_rides}`

  return <div className={stylesClass}>{text}</div>
}
export default DisplayGapsPercentage
