import { FC, PropsWithChildren } from 'react'
import './Widget.css'

const Widget: FC<PropsWithChildren> = ({ children }) => {
  return <div className="widget">{children}</div>
}

export default Widget
