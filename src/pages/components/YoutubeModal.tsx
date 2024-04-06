import { useState } from 'react'
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

  return (
    <>
      <InfoCircleOutlined
        onClick={() => setVisible(true)}
        className="modal-info-ico"
        aria-label={label}
      />
      <Modal
        width={'1000px'}
        footer={null}
        title={title}
        open={visible}
        destroyOnClose={true}
        onCancel={() => {
          setVisible(false)
        }}>
        {
          <div className="modal-iframe-container">
            <iframe allowFullScreen src={videoUrl} />
          </div>
        }
      </Modal>
    </>
  )
}

export default InfoYoutubeModal
