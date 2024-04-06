import { useRef, useState } from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import './YotubeModal.scss'

type InfoYoutubeModalProps = {
  label: string
  videoUrl: string
  title: string
}

const InfoYoutubeModal = ({ videoUrl, label, title }: InfoYoutubeModalProps) => {
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
        aria-label={label}
      />
      <Modal width={'1000px'} footer={null} title={title} open={visible} onCancel={closeAndStop}>
        <div className="modal-iframe-container">
          <iframe ref={iframeRef} allowFullScreen src={videoUrl} />
        </div>
      </Modal>
    </>
  )
}

export default InfoYoutubeModal
