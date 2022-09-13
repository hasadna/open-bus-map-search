import React, { useEffect, useState } from 'react'
import { Input, TimePicker } from 'antd'
import LineSelector from './LineSelector'
import DirectionSelector from './DirectionSelector'
import { getStops } from '../../api/gtfs'
import styled from 'styled-components'
import OperatorSelector from './OperatorSelector'

const BASELINE_TIME = new Date('2022-09-12T06:00:00Z')

const Row = styled.div`
  display: flex;
  flex-direction: row;
`

const LinePage = () => {
  const [operatorId, setOperatorId] = useState<string | undefined>()
  const [query, setQuery] = useState<string>('')

  return (
    <div>
      <Row>
        <OperatorSelector operatorId={operatorId} setOperatorId={setOperatorId} />
      </Row>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ margin: '0 10px 0 10px', width: 320 }}
      />
      <LineSelector />
      <DirectionSelector />
      <TimePicker />
      <div
        onClick={() => {
          return
        }}
        style={{ color: 'blue', cursor: 'pointer' }}>
        SEARCH
      </div>
    </div>
  )
}

export default LinePage
