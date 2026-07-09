import SmartDisplayIcon from '@mui/icons-material/SmartDisplay'
import { Button, Typography } from '@mui/material'
import { PropsWithChildren, ReactNode } from 'react'
import { VideoTrigger } from '../VideoTrigger'
import './PageHeader.scss'

export const PageHeader = ({ children }: PropsWithChildren) => {
  return <header className="page-header">{children}</header>
}

export const PageHeaderTitle = ({ children }: { children: ReactNode }) => {
  return (
    <Typography component="h1" variant="h5" className="pageHeaderTitle">
      {children}
    </Typography>
  )
}

export const PageHeaderSubtitle = ({ children }: { children: ReactNode }) => {
  return (
    <Typography component="p" variant="body2" color="text.secondary" className="pageHeaderSub">
      {children}
    </Typography>
  )
}

type PageHeaderVideoTriggerProps = {
  children: ReactNode
  title: string
  videoUrl: string
  variant?: 'ghost' | 'outlined' | 'contained'
}

export const PageHeaderVideoTrigger = ({
  children,
  title,
  videoUrl,
  variant = 'ghost',
}: PageHeaderVideoTriggerProps) => {
  const buttonVariant = variant === 'ghost' ? 'text' : variant

  return (
    <VideoTrigger title={title} videoUrl={videoUrl}>
      {({ open }) => (
        <Button
          className="pageHeaderVideoTrigger"
          variant={buttonVariant}
          size="small"
          endIcon={<SmartDisplayIcon />}
          onClick={open}>
          {children}
        </Button>
      )}
    </VideoTrigger>
  )
}
