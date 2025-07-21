import { Card, CardContent, SxProps, Theme } from '@mui/material'
import cn from 'classnames'
import { useTheme } from 'src/layout/ThemeContext'

interface WidgetProps {
  marginBottom?: boolean
  children?: React.ReactNode
  className?: string
  sx?: SxProps<Theme>
}

const Widget = ({ marginBottom, children, className, sx }: WidgetProps) => {
  const { isDarkTheme } = useTheme()

  return (
    <Card sx={sx} className={cn('card widget', { dark: isDarkTheme, marginBottom }, className)}>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default Widget
