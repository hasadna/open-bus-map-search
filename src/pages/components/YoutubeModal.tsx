import { useState } from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
import { createPortal } from 'react-dom'
import { Modal } from 'antd'

const InfoYoutubeModal = ({ videoUrl, title }: { videoUrl: string; title: 'string' }) => {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <InfoCircleOutlined
        onClick={() => setVisible(true)}
        style={{ marginRight: '12px' }}
        aria-label="youtube-video-about"
      />
      <Modal
        width={'1000px'}
        footer={null}
        title={title}
        open={visible}
        onCancel={() => setVisible(false)}>
        <div
          style={{
            height: '0',
            paddingBottom: '52.4%',
            width: '100%',
            position: 'relative',
          }}>
          <iframe
            frameBorder={0}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            allowFullScreen
            width="932px"
            height="524px"
            src={videoUrl}
          />
        </div>
      </Modal>
    </>
  )
}

export default InfoYoutubeModal
