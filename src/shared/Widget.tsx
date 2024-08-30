import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import cn from 'classnames'

import { useTheme } from 'src/layout/ThemeContext'

const Widget = (props: { children: React.ReactNode }) => {
  const { isDarkTheme } = useTheme()
  return (
    <Card className={cn('card', { dark: isDarkTheme })}>
      <CardContent>{props.children} </CardContent>
    </Card>
  )
}

export default Widget
