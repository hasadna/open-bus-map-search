import { InfoCircleOutlined } from '@ant-design/icons'
import { KeyboardEvent } from 'react'
import { VideoTrigger } from './VideoTrigger'
import './VideoIconTrigger.scss'

type VideoIconTriggerProps = {
  label: string
  title: string
  videoUrl: string
}

export const VideoIconTrigger = ({ label, title, videoUrl }: VideoIconTriggerProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>, open: () => void) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    open()
  }

  return (
    <VideoTrigger title={title} videoUrl={videoUrl}>
      {({ open }) => (
        <InfoCircleOutlined
          className="videoIconTrigger"
          onClick={open}
          onKeyDown={(event) => handleKeyDown(event, open)}
          role="button"
          tabIndex={0}
          aria-label={label}
        />
      )}
    </VideoTrigger>
  )
}
