import React, { useEffect, useState } from 'react'
import { Input, TimePicker } from 'antd'
import LineSelector from './LineSelector'
import DirectionSelector from './DirectionSelector'
import { getStops } from '../../api/gtfs'

const BASELINE_TIME = new Date('2022-09-12T06:00:00Z')

const LinePage = () => {
  const [query, setQuery] = useState<string>('')

  useEffect(() => {
    getStops(BASELINE_TIME)
  })

  return (
    <div>
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
