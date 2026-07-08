import { Backdrop, Box, CircularProgress, Fade, Modal, Typography } from '@mui/material'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './VideoTrigger.scss'

type VideoTriggerProps = {
  children: (props: { open: () => void }) => ReactNode
  title: string
  videoUrl: string
}

export const VideoTrigger = ({ children, title, videoUrl }: VideoTriggerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isIframeLoaded, setIsIframeLoaded] = useState(false)
  const { t } = useTranslation()

  const open = () => {
    setIsIframeLoaded(false)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setIsIframeLoaded(false)
  }

  return (
    <>
      {children({ open })}
      <Modal
        open={isOpen}
        onClose={close}
        closeAfterTransition
        aria-label={title}
        className="videoTriggerModal"
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 120 } }}>
        <Fade in={isOpen} timeout={120}>
          <Box className="videoTriggerModalSurface">
            <Box className="videoTriggerFrameBox">
              {!isIframeLoaded && (
                <CircularProgress
                  className="videoTriggerLoader"
                  size={144}
                  aria-label={t('loading_video')}
                />
              )}
              {isOpen && (
                <iframe
                  allowFullScreen
                  data-loaded={isIframeLoaded ? 'true' : 'false'}
                  src={videoUrl}
                  title={title}
                  onLoad={() => setIsIframeLoaded(true)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              )}
            </Box>
            <Typography component="p" variant="body2" className="videoTriggerModalHint">
              {t('video_close_hint')}
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </>
  )
}
