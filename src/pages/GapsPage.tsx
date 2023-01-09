import React, { useContext } from 'react'
import { PageContainer } from './components/PageContainer'
import { Row } from './components/Row'
import { Label } from './components/Label'
import { TEXTS } from '../resources/texts'
import DateTimePicker from './components/DateTimePicker'
import OperatorSelector from './components/OperatorSelector'
import LineNumberSelector from './components/LineSelector'
import { SearchContext } from '../model/pageState'

const GapsPage = () => {
  const { search, setSearch } = useContext(SearchContext)
  const { operatorId, lineNumber, timestamp } = search
  return (
    <PageContainer>
      <Row>
        <Label text={TEXTS.choose_datetime} />
        <DateTimePicker
          timestamp={timestamp}
          setDateTime={(ts) => setSearch((current) => ({ ...current, timestamp: ts }))}
        />
      </Row>
      <Row>
        <Label text={TEXTS.choose_operator} />
        <OperatorSelector
          operatorId={operatorId}
          setOperatorId={(id) => setSearch((current) => ({ ...current, operatorId: id }))}
        />
      </Row>
      <Row>
        <Label text={TEXTS.choose_line} />
        <LineNumberSelector
          lineNumber={lineNumber}
          setLineNumber={(number) => setSearch((current) => ({ ...current, lineNumber: number }))}
        />
      </Row>
    </PageContainer>
  )
}

export default GapsPage
