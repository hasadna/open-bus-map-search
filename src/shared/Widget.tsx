import { Card, CardContent } from '@mui/material'
import cn from 'classnames'
import { useTheme } from 'src/layout/ThemeContext'

const Widget = ({
  marginBottom,
  children,
}: {
  marginBottom?: boolean
  children?: React.ReactNode
}) => {
  const { isDarkTheme } = useTheme()
  return (
    <Card className={cn('card widget', { dark: isDarkTheme, marginBottom })}>
      <CardContent>{children} </CardContent>
    </Card>
  )
}

export default Widget
