import React from 'react'
import { TEXTS } from 'src/resources/texts'
import './HbarChart.scss'
import cn from 'classnames'

type Entry = { name: string; total: number; actual: number; color?: string }
const numberFormatter = new Intl.NumberFormat('he-IL')

export function HbarChart({
  entries,
  complement = false, // complement the chart (100% - actual) instead of actual
}: {
  entries: Entry[]
  complement?: boolean
}) {
  const percents = entries
    .map((o) => (o.actual / o.total) * 100)
    .map((p) => (complement ? Math.max(100 - p, 0) : p))
  const width = percents.map((p) => Math.max(Math.min(p, 100), 0))

  const rows = entries.map((entry, idx) => ({
    width: width[idx],
    percent: percents[idx],
    ...entry,
  }))
  console.log(rows[0])

  return (
    <div className="HbarChart chart">
      {rows.map((entry) => {
        return (
          !!entry.percent && (
            <div className="entry" key={entry.name}>
              <div className="entryName" style={{ backgroundColor: entry.color }}>
                {entry.name}
              </div>
              <div className="entryBar">
                <div className="entryBarTotal">
                  <div
                    className={cn('entryBarActual', { small: entry.percent < 20 })}
                    style={{
                      width: `${entry.width}%`,
                      backgroundColor: entry.color,
                    }}>
                    {entry.percent.toFixed(2)}%
                  </div>
                </div>
              </div>
              <div className="overlay">
                <div className="entryTotal">
                  {TEXTS.rides_planned}: {numberFormatter.format(entry.total)}
                </div>
                <div className="entryActual">
                  {TEXTS.rides_actual}: {numberFormatter.format(entry.actual)}
                </div>
              </div>
            </div>
          )
        )
      })}
    </div>
  )
}
