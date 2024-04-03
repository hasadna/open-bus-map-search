import { useState } from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
import { createPortal } from 'react-dom'

const InfoYoutubeModal = ({ videoUrl }: { videoUrl: string }) => {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <InfoCircleOutlined
        onClick={() => setVisible(true)}
        style={{ marginRight: '12px' }}
        aria-label="youtube-video-about"
      />
      {visible && createPortal(<p>HELLO</p>, document.body)}
    </>
  )
}

export default InfoYoutubeModal
