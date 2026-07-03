import { HelpTwoTone } from '@mui/icons-material'
import { Typography } from '@mui/material'
import { Modal } from 'antd'
import { useState } from 'react'
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
      {/* span carries the label/click like the old antd icon wrapper, so the
          aria-labelled element keeps an svg descendant (tests rely on it) */}
      <span
        role="img"
        aria-label={label}
        className="modal-info-ico"
        onClick={() => setVisible(true)}>
        <HelpTwoTone fontSize="inherit" />
      </span>
      <Modal
        width={'1000px'}
        footer={null}
        styles={{
          container: { borderRadius: '12px' },
        }}
        open={visible}
        destroyOnHidden={true}
        onCancel={() => {
          setVisible(false)
        }}>
        <Typography variant="h2" sx={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 1.5 }}>
          {title}
        </Typography>
        <div className="modal-iframe-container">
          <iframe allowFullScreen src={videoUrl} title={title} />
        </div>
      </Modal>
    </>
  )
}

export default InfoYoutubeModal
