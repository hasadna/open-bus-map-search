import { useRef, useState } from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'

const InfoYoutubeModal = ({ videoUrl, title }: { videoUrl: string; title: string }) => {
  const [visible, setVisible] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  function closeAndStop() {
    const iframe = iframeRef.current

    if (iframe) {
      iframe.src = iframe.src
    }

    setVisible(false)
  }

  return (
    <>
      <InfoCircleOutlined
        onClick={() => setVisible(true)}
        style={{ marginRight: '12px' }}
        aria-label="youtube-video-about-this-page"
      />
      <Modal width={'1000px'} footer={null} title={title} open={visible} onCancel={closeAndStop}>
        <div
          style={{
            height: '0px',
            paddingBottom: '56.25%',
            width: '100%',
            position: 'relative',
          }}>
          <iframe
            frameBorder={0}
            style={{
              borderRadius: '8px',
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
            }}
            ref={iframeRef}
            allowFullScreen
            src={videoUrl}
          />
        </div>
      </Modal>
    </>
  )
}

export default InfoYoutubeModal
