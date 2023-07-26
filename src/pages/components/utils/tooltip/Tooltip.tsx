import React, { useState } from 'react'
import './Tooltip.scss'

interface TooltipProps {
  text: React.ReactNode
  children: React.ReactNode
}

const Tooltip = ({ text, children }: TooltipProps) => {
  return (
    <div className="tooltip-container">
      <div className="tooltip-trigger">{children}</div>
      <div className="tooltip">{text}</div>
    </div>
  )
}

export default Tooltip
