import React, { useState } from 'react'
import { Input, TimePicker } from 'antd'
import LineSelector from 'src/pages/components/LineSelector'
import DirectionSelector from 'src/pages/components/DirectionSelector'
import OperatorSelector from 'src/pages/components/OperatorSelector'
import { Row } from 'src/pages/components/Row'

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
