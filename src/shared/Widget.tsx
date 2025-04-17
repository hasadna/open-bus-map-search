import { Card, CardContent } from '@mui/material'
import cn from 'classnames'

import { useTheme } from 'src/layout/ThemeContext'

const Widget = (props: { children: React.ReactNode }) => {
  const { isDarkTheme } = useTheme()
  return (
    <Card className={cn('card widget', { dark: isDarkTheme })}>
      <CardContent>{props.children} </CardContent>
    </Card>
  )
}

export default Widget
