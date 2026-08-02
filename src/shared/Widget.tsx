import { Card, CardContent, SxProps, Theme, Typography } from '@mui/material'

interface WidgetProps {
  marginBottom?: boolean
  children?: React.ReactNode
  className?: string
  sx?: SxProps<Theme>
  title?: React.ReactNode
  titleSx?: SxProps<Theme>
}

const Widget = ({ marginBottom, children, className, sx, title, titleSx }: WidgetProps) => {
  return (
    <Card
      sx={{
        ...(sx || {}),
        marginBottom: marginBottom ? 2 : undefined,
        // EXPERIMENT ONLY — delete with the branch, never merge to main
        border: '3px solid #ff00ff',
      }}
      className={className}>
      <CardContent>
        {title && (
          <Typography
            variant="h2"
            sx={[
              { fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' },
              ...(Array.isArray(titleSx) ? titleSx : [titleSx]),
            ]}>
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  )
}

export default Widget
